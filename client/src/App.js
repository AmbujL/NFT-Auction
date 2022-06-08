import React, {
  useEffect,
  useState,
  createContext,
} from "react";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import DapDogoContract from "./contracts/DapDogoNFT.json";
import Header from "./Component/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import getWeb3 from "./getWeb3";
import "./App.css";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import  MyCollection from "./Component/MyCollection";
import DapDogo from "./Component/DapDogo.js"

require("dotenv").config();

export const GlobalState = createContext();


function App() {

const [web3, setWeb3] = useState(undefined);
const [accounts, setAccounts] = useState(undefined);
const [instance, setInstance] = useState(undefined);
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
      try {
        const web3 = await getWeb3();
        const accounts = await web3.eth.getAccounts();
        setWeb3(web3);
        setAccounts(accounts);
      } catch (error) {
        console.log(error);
      }
    };
    init();
  }, []);

  const login = async () => {
    if (!isAuthenticated) {
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
        token_address: "0x057Ec652A4F150f7FF94f089A38008f49a0DF88e",
        token_id: "15",
        contract_type: "ERC721",
        owner_of: "0x057Ec652A4F150f7FF94f089A38008f49a0DF88e",
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

  if (typeof web3 == "undefined") {
    return <>metamask login</>;
  }
   
const Home = () => {
  

  

  return (
    <>
        <Header login={login} logOut={logOut}  />
        <Outlet />

    </>
  );
};  
    
  


  return (
    <>
      <GlobalState.Provider
        value={{
          web3,
          accounts,
          instance,
          setAccounts,
          setInstance,
          isAuthenticated,
        }}
      >
        {console.log(web3)}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />}>
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
