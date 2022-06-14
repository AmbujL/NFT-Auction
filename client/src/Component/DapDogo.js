import React,{useState,useReducer,useContext, useEffect} from 'react';
import {GlobalState} from '../App';
import DapDogoContract from "../contracts/DapDogoNFT.json";
import { Button } from "react-bootstrap";

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
    case "reset":
      return [];
    default:
      throw new Error();
  }
}


export default function () {
    const [image, setImage] = useState([]);
    const baseURL = process.env.REACT_APP_BASE_URL;
    const [NFTMetadata, dispatch] = useReducer(reducer, []);
  const [quantity, updateQuantity] = useState(0);
    const [instance, setInstance] = useState(undefined);
    const { web3,  accounts  } = useContext(GlobalState);
    
    useEffect(() => {
      const init = async () => {
        try {
           const netId = await web3.eth.net.getId();
        const deployedNetwork = DapDogoContract.networks[netId];
        const instance = new web3.eth.Contract(
          DapDogoContract.abi,
          deployedNetwork.address
        );

        setInstance(instance);
        await fetchNFTJSON();
        }
        catch (error) {
          console.log(error);
        }
       
      };
      init();
    }, [baseURL, accounts]);

  const fetchNFTJSON = async () => {
    dispatch({ type: "reset", payload: {} })
    
      for (var i = 1; i <= 6; i++) {
        await fetch(baseURL.concat(i, ".json"))
          .then((res) => res.json())
          .then((json) => {

            dispatch({
              type: "all",
              payload: {
                ...json,
                updatedImgUrl: "https://gateway.pinata.cloud/ipfs/".concat(
                  json.image.slice(7)
                  
                )
              },
            });
          
  
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
          });
      }
    };
    const handleClick = (val) => {
      var tag_id = document.getElementById("show");
      tag_id.innerHTML = val.name;
  };
  
    const mintToken = async (quantity) => {
      try {
        if (typeof quantity !== "number")
          throw new Error("quanity must be a number");
        const amount = web3.utils.toWei(String(quantity * 0.1), "ether");
        instance.methods
          .mint(quantity)
          .send({ from: accounts[0], value: amount });
      } catch (error) {
        console.log(error);
      }
    };

    function increament() {
      if (quantity >= 5) return;
      updateQuantity(quantity + 1);
    }
    function decreament() {
      if (quantity <= 0) return;
      updateQuantity(quantity - 1);
    }

    return (
      <>
        <div className="mt-5">
          <div>
            <h3>Mint one of these Collection! </h3>
            <div className="d-flex justify-content-evenly w-25 mb-5">
              <Button onClick={() => increament()}> increament</Button>
              <p id="flag">{quantity}</p>
              <Button onClick={() => decreament()}> decreament</Button>
            </div>

            <Button onClick={() => mintToken(quantity)}>
              Click to Mint a Token !
            </Button>
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