
Moralis.Cloud.afterSave("AuctionStarted", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();
  
  logger.info(`Looking for confirmed TX... with AuctionStarted event... ${confirmed}`);
  if (confirmed) {

    logger.info("Found item!");
  
    const activeAuction = Moralis.Object.extend("activeAuction");
    // Add new activeAuction
    const activeItem = new activeAuction();
    activeItem.set("marketplaceAddress", request.object.get("address"));
    activeItem.set("nftAddress", request.object.get("nftAddress"));
    activeItem.set("price", request.object.get("price"));
    activeItem.set("tokenId", request.object.get("tokenNumber"));
    activeItem.set("seller", request.object.get("ownerofToken"));
    activeItem.set("validity", request.object.get("time"));
    activeItem.set("bid", "0");
    activeItem.set("bidder", "none");
    activeItem.set("status", "started");

    logger.info(
      `Adding Address: ${request.object.get(
        "address"
      )} TokenId: ${request.object.get("tokenNumber")}`
    );
    logger.info("Saving...");
    await activeItem.save();
  }
});



Moralis.Cloud.afterSave("BidMade", async (request) => {
  const confirmed = request.object.get("confirmed");
  const logger = Moralis.Cloud.getLogger();
  logger.info("Looking for confirmed TX... in BidMade");

  if (confirmed) {
    logger.info("Found item!");
    const activeAuction = Moralis.Object.extend("activeAuction");

    // In case of listing update, search for already listed activeAuction and delete
    const query = new Moralis.Query(activeAuction);
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenNumber"));
    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("seller", request.object.get("ownerofToken"));

    logger.info(`Marketplace | Query: ${query}`);
    const alreadyListedItem = await query.first();
    if (alreadyListedItem) {
      logger.info(`Deleting ${request.object.get("objectId")}`);
      await alreadyListedItem.destroy();
      logger.info(
        `Deleted item with tokenId ${request.object.get(
          "tokenNumber"
        )} at address ${request.object.get(
          "address"
        )} since the listing is being updated. `
      );
    }

    // Add new activeAuction
    const activeItem = new activeAuction();
    activeItem.set("marketplaceAddress", request.object.get("address"));
    activeItem.set("nftAddress", request.object.get("nftAddress"));
    activeItem.set("price", request.object.get("price"));
    activeItem.set("tokenId", request.object.get("tokenNumber"));
    activeItem.set("seller", request.object.get("ownerofToken"));  
    activeItem.set("validity", request.object.get("time"));
    activeItem.set("bid", request.object.get("bindingBid"));
     activeItem.set("bidder", request.object.get("bidder"));
    activeItem.set("status", "Running");
    logger.info(
      `Adding Address: ${request.object.get(
        "address"
      )} TokenId: ${request.object.get("tokenId")}`
    );
    logger.info("Saving...");
    await activeItem.save();
  }
});



Moralis.Cloud.afterSave("AuctionFinalized", async (request) => {
  const confirmed = request.object.get("confirmed");
  logger.info(`Marketplace | Object: ${request.object}`);

  if (confirmed) {
    const logger = Moralis.Cloud.getLogger();
    const activeAuction = Moralis.Object.extend("activeAuction");
    const query = new Moralis.Query(activeAuction);
    query.equalTo("marketplaceAddress", request.object.get("address"));
    query.equalTo("nftAddress", request.object.get("nftAddress"));
    query.equalTo("tokenId", request.object.get("tokenNumber"));
    logger.info(`Marketplace | Query: ${query}`);
    const canceledItem = await query.first();
    logger.info(`Marketplace | CanceledItem: ${canceledItem}`);
    if (canceledItem) {
      logger.info(`Deleting ${request.object.get("objectId")}`);
      await canceledItem.destroy();
      logger.info(
        `Deleted item with tokenId ${request.object.get(
          "tokenNumber"
        )} at address ${request.object.get(
          "address"
        )} from activeAuction table since it was bought.`
      );
    } else {
      logger.info(
        `No item bought with address: ${request.object.get(
          "address"
        )} and tokenId: ${request.object.get("tokenNumber")} found`
      );
    }
  }
});
