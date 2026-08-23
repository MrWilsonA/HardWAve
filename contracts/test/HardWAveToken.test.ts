import { expect } from "chai";
import { ethers } from "hardhat";

describe("HardWAveHardwareToken", function () {
  it("Should mint hardware token and record repair log", async function () {
    const [owner, manufacturer, serviceCenter, buyer] = await ethers.getSigners();

    const HardWAveFactory = await ethers.getContractFactory("HardWAveHardwareToken");
    const hardwave = await HardWAveFactory.deploy();
    await hardwave.waitForDeployment();

    const MANUFACTURER_ROLE = await hardwave.MANUFACTURER_ROLE();
    const SERVICE_CENTER_ROLE = await hardwave.SERVICE_CENTER_ROLE();

    await hardwave.grantRole(MANUFACTURER_ROLE, manufacturer.address);
    await hardwave.grantRole(SERVICE_CENTER_ROLE, serviceCenter.address);

    // 1. Manufacturer registers a new GPU
    const serial = "HW-RTX3090-TEST-001";
    await hardwave.connect(manufacturer).registerHardware(
      buyer.address,
      serial,
      "GeForce RTX 3090 Founders Edition",
      "GPU",
      "ipfs://QmTestMetadataURI"
    );

    const tokenId = await hardwave.getTokenIdBySerial(serial);
    expect(tokenId).to.equal(1n);

    // 2. Service Center logs a repair on cooling fan
    await hardwave.connect(serviceCenter).logRepair(
      tokenId,
      "cooling_fan",
      "Replaced faulty ball-bearing cooling fan with OEM part",
      true,
      "ipfs://QmTestReceiptRepairHash"
    );

    // 3. Inspect repair history
    const history = await hardwave.getRepairHistory(tokenId);
    expect(history.length).to.equal(1);
    expect(history[0].componentName).to.equal("cooling_fan");
    expect(history[0].isReplaced).to.equal(true);
    expect(history[0].technician).to.equal(serviceCenter.address);
  });
});
