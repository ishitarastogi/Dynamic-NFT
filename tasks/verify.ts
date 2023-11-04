import { utils } from 'ethers';

import { task } from 'hardhat/config';
import { join } from 'path';


task('etherscan-verify', 'verify').setAction(async ({}, hre) => {

  await hre.run('verify:verify', {
    address: "0x18AcAA1f7Bd1CBd11cbc80e89Ba1A34ad68ac824",
    constructorArguments: ["0xbb97656cd5fece3a643335d03c8919d5e7dcd225"],
  });
});
