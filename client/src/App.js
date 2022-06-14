import React, {
  useEffect,
  useState,
  createContext,
} from "react";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import DapDogoContract from "./contracts/DapDogoNFT.json";
import AuctionContract from "./contracts/NFTAuction.json";
import Header from "./Component/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import getWeb3 from "./getWeb3";
import "./App.css";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import  MyCollection from "./Component/MyCollection";
import DapDogo from "./Component/DapDogo.js"
import ShowNFTs, { NFTItem } from "./Component/ShowNFTs.js"


require("dotenv").config();

export const GlobalState = createContext();

function App() {

const [web3, setWeb3] = useState(undefined);
const [accounts, setAccounts] = useState([]);
const [auctionInstance, setAuctionInstance] = useState(undefined);
const Web3Api = useMoralisWeb3Api();
  
const {
  authenticate,
  isAuthenticated,
  isInitialized,
  isAuthenticating,
  isWeb3EnableLoading,
  isWeb3Enabled,
  user,
  logout,
} = useMoralis();
  
  
  useEffect(() => {
    const init = async () => {

       if (window.ethereum) {
         window.ethereum.on("chainChanged", () => {
           window.location.reload();
         });
         window.ethereum.on("accountsChanged", async () => {
           window.location.reload();
           await logOut();
         });
    
       }
      if (isAuthenticated)
        await web3getter();
    };

    init();
  }, [isAuthenticated, setAccounts]);

  
  async function web3getter (){
       try {
          const web3 = await getWeb3();
          console.log("inside useEffect");
         const accounts = await web3.eth.getAccounts();
           const netId = await web3.eth.net.getId();
         const auctionAddress = AuctionContract.networks[netId].address;
          const auctionInstance = new web3.eth.Contract(
            AuctionContract.abi,
            auctionAddress
          );

         setWeb3(web3);
         setAccounts(accounts);
         setAuctionInstance(auctionInstance);
        } catch (error) {
          console.log(error);
        }
  }
  


  const login = async () => {
    console.log("login invoked", isAuthenticated);

    if (!isAuthenticated) {
      await web3getter();
        await authenticate({ signingMessage: "Log in to NFT Auction" })
          .then(async function (user) {
            console.log("logged in user:", user);
            console.log(user.get("ethAddress"));
          })
          .catch(function (error) {
            console.log(error);
          });
      
    }
   
  };

  const logOut = async () => {
    await logout().then((obj) => console.log(obj));
  };

  const fetchNFTs = async () => {
    // get mainnet NFT transfers for the current user
    const testData = [
      {
        token_address: DapDogoContract.networks["5577"].address,
        token_id: "3",
        contract_type: "ERC721",
        owner_of: accounts[0],
        block_number: "88256",
        block_number_minted: "88256",
        token_uri:
          "https://gateway.pinata.cloud/ipfs/QmWWXWxH5uPF458MyKPqLtmPXfe4VdcMNUA8odn4J8HY1W/2.png",
        metadata: "string",
        synced_at: "string",
        amount: "1",
        name: "cpto Dogger",
        symbol: "RARI",
      },
    ];
    //  const bscBalance = await web3.account.getNativeBalance();
    // console.log(bscBalance);
    
    // const NFTsOwned = await Web3Api.account.getNFTs({
    //   chain: "ropsten",
    // });
    // console.log(NFTsOwned);
    return testData
   
  };


  if (isAuthenticating) {
    return (<><div>
      Authenticating wait...
    </div></>);
  }


   
const Home = () => {
  // const [msg, setMsg] = useState(undefined);

  // useEffect(() => {
  //   if (!isAuthenticated && web3)
  //     setMsg("please Authenticate First");
  //   else if (!web3 && isAuthenticated)
  //     setMsg("oops.. seems like your wallet got disconnected");
  //   else if (!web3 && !isAuthenticated)
  //     setMsg("Please Login first ..");
  // }, [isAuthenticated, web3]);
  
  
    return (
      <>
        {/* {console.log("e home hayi")} */}
        <Header login={login} logOut={logOut} />
        {!isAuthenticated || !web3 ? (
          
          (!isAuthenticated && web3)? <div>Authentication Lost ! please Click on Login  .. </div>:(
        (isAuthenticated && !web3)? <div>oops.. seems like your wallet got disconnected . connect it via metamask </div>:
          ((!isAuthenticated && !web3)? <div>please login first .. </div>:<></>)
        ))
        :(<Outlet />)         
      }
      </>
    );
};  
    
  


  return (
    <>
      <GlobalState.Provider
        value={{
          web3,
          accounts,
          setAccounts,
          auctionInstance,
        }}
      >
        {console.log({ web3 }, { isAuthenticated },{accounts})}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />}>
              <Route index element={<ShowNFTs />} />
              <Route path="DappDogo" element={<DapDogo />} />
              <Route
                path="collection"
                element={<MyCollection fetchNFTs={fetchNFTs} />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </GlobalState.Provider>
    </>
  );
}




export default App;
