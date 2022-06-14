// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract NFTAuction {


    uint256 incrementFactor; // increment factor to be added
    address payable admin; // admin can retrieve commision fund
    uint256 private commision; // commision of 3% to be collected on each auction
     enum state {Started,Ended,Cancelled}  
    using SafeMath for uint256;

    struct  AuctionDetails {
        address payable  owner ;   // owner of a nft
        uint256   highestBindingBid; // selling price of artifact
        address  highestBidder;   // address of highest bidder at a point in time        
        mapping(address => uint)  bids;   // mapping containing bid for each participant
        address payable []  auctionParticipant; // array for traversing through addresss
        uint256 startingTime;  
        uint256 starting_price;  
        uint endingTime;
        state  auction;
    }


    mapping(address=>mapping(uint256=>AuctionDetails)) public AuctonableNFT;   // auctioning of a token of a specific NFT


     constructor() {
        admin= payable(msg.sender);
        incrementFactor= 0.1 ether;
    }


    modifier onlyOwner(address _contractAddress, uint256 tokenNumber){
        require(IERC721(_contractAddress).ownerOf(tokenNumber)==msg.sender,"token registered to different address");
        _;
    }

     modifier notOwner(address _contractAddress, uint256 tokenNumber){
        require(IERC721(_contractAddress).ownerOf(tokenNumber)!=msg.sender,"Owner of token can not participate");
        _;
    }

    modifier onlyAdmin{
        require(admin==msg.sender,"only admin can access this method");
        _;
    }

    //  modifier stateconstraint{
    //     require(auction!=state.Ended,"auction ended");
    //     require(auction!=state.Cancelled);
    //     _;
    // }


    event AuctionStarted(address indexed nftAddress, uint256 indexed tokenNumber , address indexed ownerofToken,  uint256 price, uint256 time); 
    event BidMade(address indexed nftAddress, uint256 indexed tokenNumber ,address indexed ownerofToken ,address bidder, uint256 bindingBid, uint256 time, uint256 price);
   // event AuctionCanceled (address indexed nftAddress , uint256 indexed tokenNumber, address indexed owner );
    event AuctionFinalized (address indexed nftAddress, uint256 indexed tokenNumber , address indexed ownerofToken );


    //starting auction of a token

    function startAuction(address _contractAddress, uint256 tokenNumber , uint256 price , uint256 _time)
     external onlyOwner(_contractAddress,tokenNumber){
        
         AuctionDetails storage ad= AuctonableNFT[_contractAddress][tokenNumber];
             require(ad.auction==state.Started,"already running");
         ad.owner=payable(msg.sender);
         ad.auction=state.Started;
         ad.startingTime=block.number;
         ad.starting_price= price;
         ad.endingTime=ad.startingTime.add(_time.mul(6545)); // calculating time in terms of block, 1 block takes 13.2 seconds to get mined :24 hrs =6545

         emit AuctionStarted(_contractAddress,tokenNumber,msg.sender,price,_time.mul(6545));
    }

    // Internal utility min Function

    function min(uint a, uint b) internal pure returns (uint){
        return a<=b?a:b;
    }



    function enterBid(address _contractAddress , uint256 tokenNumber) external
     payable notOwner(_contractAddress,tokenNumber) returns (bool)
    {
          require(msg.value!=0,"0 given ! , please provide valid ether's");
      
        AuctionDetails storage ad= AuctonableNFT[_contractAddress][tokenNumber];
         ad.auction= block.number>=ad.endingTime?state.Ended:ad.auction;

         require(ad.auction!=state.Ended,"Auction Ended");
         require(ad.auction!=state.Cancelled,"Auction has been canceled");

        uint currentBid=ad.bids[msg.sender]+msg.value;

        uint256 biddingPrice =ad.bids[ad.highestBidder]==0? ad.starting_price:ad.bids[ad.highestBidder]; // here condition was added to include initial price for starting auction .

        require(currentBid>=biddingPrice,"bid is less then the selling price");

         if(ad.bids[msg.sender]==0){
         ad.auctionParticipant.push(payable (msg.sender));
       }
        ad.bids[msg.sender]=currentBid;

       if(ad.bids[msg.sender]>=ad.bids[ad.highestBidder])
       {
           
        ad.highestBindingBid= min(ad.bids[msg.sender],biddingPrice+incrementFactor);
        ad.highestBidder=msg.sender;
       }
       else{
           ad.highestBindingBid= min(ad.bids[msg.sender].add(incrementFactor),ad.bids[ad.highestBidder]);

       }


       emit BidMade(_contractAddress,tokenNumber,ad.owner , msg.sender,ad.highestBindingBid,(ad.endingTime.sub(block.number)).mul(13),ad.starting_price);
       return true; 
    }

    // function getAuctionDetails(address _contractAddress , uint256 tokenNumber) internal returns(AuctionDetails storage)
    // {
    //      return AuctonableNFT[_contractAddress][tokenNumber];
        
    // }

    function cancelAuction(address _contractAddress , uint256 tokenNumber) external 
    onlyOwner(_contractAddress,tokenNumber) returns(bool)
    {
       AuctonableNFT[_contractAddress][tokenNumber].auction =state.Cancelled;

       return finalizeAuction(_contractAddress,tokenNumber);
        //  emit AuctionCanceled ( _contractAddress ,  tokenNumber,  msg.sender );
        // return true;
    }

    function finalizeAuction(address _contractAddress , uint256 tokenNumber) public 
        onlyOwner(_contractAddress,tokenNumber) returns  (bool)
        {  
         AuctionDetails storage ad= AuctonableNFT[_contractAddress][tokenNumber];
         IERC721 nftObj=IERC721(_contractAddress);
        require(ad.auction==state.Cancelled || ad.auction==state.Ended,"Sorry! auction is still not completed");
        
        transfer_ether(ad , nftObj, tokenNumber);

        delete (AuctonableNFT[_contractAddress][tokenNumber]);
        emit AuctionFinalized(_contractAddress, tokenNumber, msg.sender);

        return true;

    }

     function transfer_ether(AuctionDetails storage ad , IERC721 nftObj, uint256 tokenNumer) internal  {
        require(ad.owner==msg.sender,"only owner can perform this operation");

        for(uint i=0;i<ad.auctionParticipant.length;i++){
                if(ad.auctionParticipant[i]==ad.highestBidder && ad.auction==state.Ended){ // Caution!!!: remember to change cancelled to ended
                    
                uint256 remainingAmount =  ad.bids[ad.auctionParticipant[i]].sub(ad.highestBindingBid); // difference bwtween selling price and ether provided by highest bidder
                uint interest = (ad.highestBindingBid*3)/100;
                uint256 sellingPrice= ad.highestBindingBid.sub(interest); // selling price adjusted after taking commision
                commision+= interest;


                ad.auctionParticipant[i].transfer(remainingAmount);   // remaining amount to be sent back to the bidder
                ad.owner.transfer(sellingPrice);         // transfering fund to owner
                nftObj.safeTransferFrom(msg.sender,ad.highestBidder,tokenNumer);
                }
                  
                else
                    {
                        ad.auctionParticipant[i].transfer(ad.bids[ad.auctionParticipant[i]]);
                    }
            }  
    }



    function withdraw(address _contractAddress , uint256 tokenNumber) public
     { 
          AuctionDetails storage ad= AuctonableNFT[_contractAddress][tokenNumber];
          require(ad.auction==state.Ended || ad.auction==state.Cancelled,"auction is running");
          if(ad.bids[msg.sender]>=0)
          {
              payable(msg.sender).transfer(ad.bids[msg.sender]);
          }

    }


    function withdrawCommision() public onlyAdmin {
        require(commision>=0,"Nothing to widhrawn");
        admin.transfer(commision);
    }

    function balance() public view onlyAdmin returns (uint){
        return (address(this).balance);
    }


}
