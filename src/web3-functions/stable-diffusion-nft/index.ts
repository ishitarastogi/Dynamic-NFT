/* eslint-disable @typescript-eslint/naming-convention */
import {
  Web3Function,
  Web3FunctionContext,
  Web3FunctionEventContext,
} from "@gelatonetwork/web3-functions-sdk";
import { Contract } from "ethers";
import { NFTStorage, File } from "nft.storage";
import axios, { AxiosError } from "axios";
import { Interface } from "ethers/lib/utils";

const NFT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "function revealNft(uint256 tokenId, string memory tokenURI) external",
  "function tokenURI(uint256 tokenId) public view returns (string memory) ",
  "function tokenIds() public view returns(uint256)",
  "function tokenIdByUser(address) public view returns(uint256)",
  "function nightTimeByToken(uint256) public view returns(bool)",
  "function mint(bool _isNight) external",
  "event MintEvent(uint256 _tokenId)",
];

const NOT_REVEALED_URI =
  "https://bafkreid2ribchf7vnxtmrmpf7jkbgtohlbof5j4stiippcpmqs37s6o7ze.ipfs.nftstorage.link/";

function generateNftProperties(isNight: boolean) {
  const timeSelected = isNight ? "night" : "sunset";

  const description = `People doing Rajasthan's folk dance in Jaipur's jantarmantar at ${timeSelected}   8K resolution, hyperrealism`;
  return {
    description,
    attributes: [
      { trait_type: "Time", value: timeSelected },
       { trait_type: "Time", value: timeSelected },
      { trait_type: "Place", value: "Jaipur" },
      { trait_type: "Action", value: "Dance" },
    ],
  };
}
// SECRET_PHASE: FROZE

Web3Function.onRun(async (context: Web3FunctionEventContext) => {
  const { userArgs, multiChainProvider, secrets, storage, log } = context;
  console.log(log);
  const provider = multiChainProvider.default();
  ////// User Arguments
  const nftAddress = userArgs.nftAddress as string;
  console.log("nftAddress", nftAddress);

  const network = await provider.getNetwork();
  console.log(network);

  if (!nftAddress)
    throw new Error("Missing userArgs.nftAddress please provide");

  ////// User Secrets
  const nftStorageApiKey = await secrets.get("NFT_STORAGE_API_KEY");
  const stableDiffusionApiKey = await secrets.get("STABLE_DIFFUSION_API_KEY");

  if (!nftStorageApiKey || !stableDiffusionApiKey) {
    console.error("Error: Missing secrets");
    return {
      canExec: false,
      message: "Error: Missing Secrets",
    };
  }

  // Retreive current state
  const nft = new Contract(nftAddress as string, NFT_ABI, provider);
  // console.log("NFT Contract", nft);
  const nftInterface = new Interface(NFT_ABI);
  // console.log("NFT Interface", nftInterface);

  const event = nftInterface.parseLog(log);
  // console.log("Event", event);

  const { _tokenId } = event.args;
  console.log("Minted tokenId", _tokenId);
  // Retrieve the last processed ID from storage
  const lastProcessedId = parseInt(
    (await storage.get("lastProcessedId")) ?? "0"
  );
  console.log("Last Processed tokenId", lastProcessedId);
  const currentTokenId = _tokenId.toNumber();

  console.log("currentTokenId", currentTokenId);
  if (currentTokenId === lastProcessedId) {
    return { canExec: false, message: "No New Tokens" };
  }

  // Get batch of next token ids to process in parallel
  const tokenIds: number[] = [];
  let tokenId = _tokenId;

  const tokenURI = await nft.tokenURI(tokenId);
  if (tokenURI === NOT_REVEALED_URI) {
    tokenIds.push(tokenId);
  } else {
    console.log(`#${tokenId} already revealed!`);
  }

  console.log("NFTs to reveal:", tokenIds);
  const tokensData = await Promise.all(
    tokenIds.map(async (tokenId) => {
      // Generate NFT properties
      const isNight = await nft.nightTimeByToken(tokenId);
      const nftProps = generateNftProperties(isNight);
      console.log(
        `#${tokenId} Stable Diffusion prompt: ${nftProps.description}`
      );

      // Generate NFT image with Stable Diffusion
      let imageUrl: string | null = null;
      try {
        const stableDiffusionResponse = await fetch(
          "https://stablediffusionapi.com/api/v3/text2img",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              key: stableDiffusionApiKey,
              prompt: nftProps.description,
              negative_prompt: null,
              width: "512",
              height: "512",
              samples: "1",
              num_inference_steps: "20",
              seed: null,
              guidance_scale: 7.5,
              safety_checker: "yes",
              multi_lingual: "no",
              panorama: "no",
              self_attention: "no",
              upscale: "no",
              embeddings_model: "embeddings_model_id",
              webhook: null,
              track_id: null,
            }),
          }
        );
        const stableDiffusionData = await stableDiffusionResponse.json();
        console.log(stableDiffusionData.output[0]);
        imageUrl = stableDiffusionData.output[0] as string;
        console.log(`Stable Diffusion generated image: ${imageUrl}`);
      } catch (_err) {
        const stableDiffusionError = _err as AxiosError;
        if (stableDiffusionError.response) {
          const errorMessage = stableDiffusionError.response?.status
            ? `${stableDiffusionError.response.status}: ${stableDiffusionError.response.data}`
            : stableDiffusionError.message;
          return {
            canExec: false,
            message: `Stable Diffusion error: ${errorMessage}`,
          };
        }
      }
      // Publish NFT metadata on IPFS
      if (imageUrl !== null) {
        const imageBlob = (await axios.get(imageUrl, { responseType: "blob" }))
          .data;
        const nftStorage = new NFTStorage({ token: nftStorageApiKey });

        const imageFile = new File([imageBlob], `gelato_nft_${tokenId}.png`, {
          type: "image/png",
        });
        const metadata = await nftStorage.store({
          name: `GelatoNft #${tokenId}`,
          description: nftProps.description,
          image: imageFile,
          attributes: nftProps.attributes,
          collection: {
            name: "GelatoNfts",
            family: "gelato--nfts",
          },
        });
        console.log(`#${tokenId} IPFS Metadata ${metadata.url}`);

        return { id: tokenId, url: metadata.url };
      }
    })
  );

  await storage.set("lastProcessedId", tokenId.toString());

  const addresses: string[] = [];
  const callDatas: Array<{ to: string; data: string }> = [];

  tokensData.forEach((token) => {
    callDatas.push({
      to: nft.address,
      data: nft.interface.encodeFunctionData("revealNft", [
        token!.id,
        token!.url,
      ]),
    });
  });

  return {
    canExec: true,
    callData: callDatas,
  };
});
