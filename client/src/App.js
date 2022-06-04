import React, { useEffect,useState ,useReducer} from "react";
import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";
import DapDogoContract from "./contracts/DapDogoNFT.json";
import Header from "./Component/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, ButtonGroup } from "react-bootstrap/";
import getWeb3 from "./getWeb3";
import "./App.css";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";

require("dotenv").config();

function App() {
  const Web3Api = useMoralisWeb3Api();

  const {
    authenticate,
    isAuthenticated,
    isAuthenticating,
    user,
    account,
    logout,
    
  } = useMoralis();

  useEffect(() => {
    if (isAuthenticated) {
      // add your logic here
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const login = async () => {
    if (!isAuthenticated) {
      await authenticate({ signingMessage: "Log in to NFT Auction" })
        .then(function (user) {
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

  const fetchNFTTransfers = async () => {
    // get mainnet NFT transfers for the current user
    const transfersNFT = await Web3Api.account.getNFTTransfers({
      address: "0xB6Cc6Cc5e2bA9e8B0Bd72F22E61D05697dd8093A",
    });
    console.log(transfersNFT);
    const bscBalance = await Web3Api.account.getNativeBalance();
    console.log(bscBalance);
  };

  return (
    <>
      <Header />
        <Outlet />
      <Routes>
        <Route path="collection" element={<Collection />} />
        <Route path="component" element={<Collection />} />
      </Routes>
    </>
  );
}




 function reducer(state, action) {
   switch (action.type) {
     case "all":
       return [
         ...state,
         {
           name: action.payload.name,
           src: action.payload.updatedImgUrl,
           edition: action.payload.edition,
         },
       ];
     case "onlyImage":
       return [...state, { src: action.payload.image }];
     default:
       throw new Error();
   }
 }


const Collection = () => {
  const [web3, setWeb3] = useState(undefined);
  const [accounts, setAccounts] = useState(undefined);
  const [instance, setInstance] = useState(undefined);
  const [image, setImage] = useState([]);
  const baseURL = process.env.REACT_APP_BASE_URL;
  const [NFTMetadata, dispatch] = useReducer(reducer, []);
  const [quantity, updateQuantity] = useState(0);
  
  useEffect(() => {
    const init = async () => {

      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const instance = new web3.eth.Contract(
        DapDogoContract.abi,
        "0x6A0576B8e6e6FAF498F103E27Ef7609366b148e2"
      );
      setWeb3(web3);
      setAccounts(accounts);
      setInstance(instance);
      
  
    }
    init()
   
    fetchNFTJSON();
  }, [baseURL , accounts])
  
  const fetchNFTJSON = async () => {
  
    for (var i = 1; i <= 9; i++) {
      
      await  fetch(baseURL.concat(i,".json"))
         .then((res) => res.json())
        .then(async (json) => {

           dispatch({
            type: "all",
            payload: {
              ...json,
              updatedImgUrl: "https://gateway.pinata.cloud/ipfs/".concat(
                json.image.slice(7)
              ),
            },
          })

          //  await fetch("https://gateway.pinata.cloud/ipfs/".concat( json.image.slice(7)))
          //    .then((res) => res.blob())
          //    .then((blob) => {
          //      console.log(blob);

          //     dispatch({
          //       type: "all",
          //       payload: {
          //         ...json,
          //         updatedImgUrl: URL.createObjectURL(blob)
          //       },
          //     });



          //    })
          
          // dispatch({
          //   type: "all",
          //   payload: {
          //     ...json,
          //     updatedImgUrl: "https://gateway.pinata.cloud/ipfs/".concat(
          //       json.image.slice(7)
          //     ),
          //   },
          // })

          })
    }

  }
  const handleClick = (val) => {
    var tag_id = document.getElementById("show");
    tag_id.innerHTML = val.name;

  }
  const mintToken = async (quantity) => {
    try {
      if (typeof quantity !== "number")
        throw new Error("quanity must be a number")
      const amount = web3.utils.toWei( String(quantity*0.1), 'ether');
    instance.methods.mint(quantity).send({from:accounts[0],value:amount})
    } catch (error) {
      console.log(error)
    }
    
  }
 
  var count=0
  return (
    <>
      <div className="mt-5">
        <div>
          <h3>Mint one of these Collection! </h3>
          <Button onClick={() => count++}> increament</Button>
          <p>{console.log(count)}</p>
          <Button onClick={() => count--}> decreament</Button>
          <Button onClick={() => mintToken(count)}> Click to Mint a Token !</Button>
        </div>
        <div className="container row">
          <div className="col-md">
            <div className="row no-gutters">
              {NFTMetadata.map((val, k) => {
                return (
                  <div className="col-sm-4" key={k}>
                    <img
                      src={val.src}
                      className={"img-fluid " + "p-1"}
                      onClick={() => handleClick(val)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="col-md order-first">
            <h3 className="font-weight-light">Info</h3>
            <p id="show"></p>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

