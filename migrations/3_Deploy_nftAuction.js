var Nft_Auction = artifacts.require("./NFTAuction.sol");


module.exports = function (deployer) {
    deployer.deploy(Nft_Auction);
};

