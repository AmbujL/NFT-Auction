import React, { useEffect, useState, createContext } from "react";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import AuctionContract from "./contracts/NFTAuction.json";
import Header from "./Component/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import getWeb3 from "./getWeb3";
import "./App.css";
import { useMoralis, useMoralisWeb3Api, useMoralisQuery } from "react-moralis";
import MyCollection from "./Component/MyCollection";
import DapDogo from "./Component/DapDogo.js";
import ShowNFTs from "./Component/ShowNFTs.js";
import loginmsg from "./loginmsg.png";
import authlost from "./authlost.webp";

require("dotenv").config();

export const GlobalState = createContext();
export const ListedNFts = createContext(); 

function App() {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState([]);
  const [auctionInstance, setAuctionInstance] = useState(undefined);
  const [netId, setNetId] = useState(undefined);
  const Web3Api = useMoralisWeb3Api();

  const { authenticate, isAuthenticated, isAuthenticating, logout } =
    useMoralis();
  
      

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        window.ethereum.on("chainChanged", () => {
          window.sessionStorage.setItem("session", false);
          window.location.reload();
        });
        window.ethereum.on("accountsChanged", async () => {
          window.location.reload();
          await logOut();
        });
      } else {
        window.sessionStorage.setItem("session", false);
      }

      if (isAuthenticated) {
        await web3getter();
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated,setAccounts]);

  async function web3getter() {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const netId = await web3.eth.net.getId();
      const auctionAddress = AuctionContract.networks[netId].address;
      const auctionInstance = new web3.eth.Contract(
        AuctionContract.abi,
        auctionAddress
      );

      setWeb3(web3);
      setAccounts(accounts);
      window.sessionStorage.setItem("session",true);
      setNetId(netId);
      setAuctionInstance(auctionInstance);
    } catch (error) {
      console.log(error);
    }
  }

  const login = async () => {

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

    const network = {
      3: 'ropsten',
      5: 'goerli',
      4: 'rinkeby'
    };

    const NFTsOwned = await Web3Api.account.getNFTs({
      chain: network[netId],
      address: accounts[0],
    });
    // console.log(NFTsOwned);
    return NFTsOwned?.result;
  };

  if (isAuthenticating) {
    return (
      <>
        <div className="text-muted mt-3 display-5 text-center">
          Authenticating wait...
        </div>
      </>
    );
  }

  const Home = () => {
 const { data: listedNfts, isFetching: fetchingListedNFts } = useMoralisQuery(
   "activeAuction",
   (query) => query.limit(20).descending("tokenId")
 );
    
    
    
    return (
      <>
        <ListedNFts.Provider value={{ listedNfts, fetchingListedNFts }}>
          <Header login={login} logOut={logOut} />
          {!isAuthenticated || !web3 ? (
            !isAuthenticated && web3 ? (
              <div className="text-center mt-5">
                <img
                  src={authlost}
                  alt="authlost"
                  style={{ width: "300px", height: "300px" }}
                />
                <p className="text-muted mt-3 display-5">
                  Authentication Lost ! please Click on Login ..
                </p>
              </div>
            ) : isAuthenticated && !web3 ? (
              JSON.parse(window.sessionStorage.getItem("session")) ? (
                <div className="display-5 text-center text-muted mt-5">
                  Loading....
                </div>
              ) : (
                <div className="container text-center mt-5">
                  <img src={loginmsg} alt="loginmsg" className="roundness-all" />
                  <p className="text-muted mt-3 display-5">
                    oops.. seems like your wallet got disconnected . connect it
                    via metamask
                  </p>
                </div>
              )
            ) : !isAuthenticated && !web3 ? (
              <div className="text-center mt-5">
                <p className="text-muted mt-3 display-5">
                  Please login first ..
                </p>
              </div>
            ) : (
              <></>
            )
          ) : (
            isAuthenticated && web3 && accounts[0] && <Outlet />
          )}
        </ListedNFts.Provider>
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
          isAuthenticated,
          Web3Api,
        }}
      >
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />}>
              <Route
                index
                element={
                  <ShowNFTs
                  />
                } />

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
