import React, { useContext } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import {AiOutlineFileSearch} from "react-icons/ai";
import { GlobalState } from '../App';
import "../App.css"


export default function ({BidingTable}) {
    
  const { web3 } = useContext(GlobalState);



  if (typeof BidingTable[0]=='undefined')
  {
    return (
        <>
        <div className="text-center my-2">
          <AiOutlineFileSearch className="fa-3x" />
          <div className="text-muted"> No Items</div>
        </div>
      </>
    );
  }
    return (
      <>
        <Table className="table text-light " hover variant="dark">
          <thead className="border-bottom-0 bg-dark">
            <tr className="text-muted">
              <th>Bidder</th>
              <th>Token ID</th>
              <th>Bid</th>
              <th>Total Invested</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody className="bg-dimdark">
            {BidingTable.map((item, index) => {
              return (
                <tr
                  key={index}
                  className="text-truncate text-center "
                  style={{ height: "100%" }}
                >
                  <td>
                    <div
                      className="text-truncate d-block"
                      style={{ maxWidth: "120px" }}
                    >
                      <OverlayTrigger
                        placement="left"
                        overlay={
                          <Tooltip>
                            <strong> {item?.attributes?.bidder}</strong>.
                          </Tooltip>
                        }
                      >
                        <span> {item?.attributes?.bidder} </span>
                      </OverlayTrigger>
                    </div>
                  </td>
                  <td>{item?.attributes?.tokenNumber}</td>

                  <td>
                    {web3.utils.fromWei(item?.attributes?.bid)}
                    <i className="fa-brands fa-ethereum"></i>
                  </td>
                  <td>
                    {web3.utils.fromWei(item?.attributes?.currentBid)}
                    <i className="fa-brands fa-ethereum"></i>
                  </td>

                  <td>
                    {item.updatedAt
                      .toString()
                      .replace("GMT+0530 (India Standard Time)", " IST")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </>
    );

}