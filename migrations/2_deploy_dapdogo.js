

var Dapper_dogo = artifacts.require("./DapDogoNFT.sol");

module.exports = function (deployer) {
    deployer.deploy(Dapper_dogo).then(async () => {
      var instance = await Dapper_dogo.deployed();
      await instance
        .setBaseTokenUri(
          ("https://gateway.pinata.cloud/ipfs/QmY63C9Fcx4q8gfmx4CRfFyH5eSCcL8m23qEEboYiLFwqH/")
        )
        .then(console.log("base url has been set"));
    
      await instance.setPublicMintEnabled(true);
    }
    );
};
