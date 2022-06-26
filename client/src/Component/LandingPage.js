import React from "react";
import nftbg from "../nftbg.png";

export default function () {
  return (
    <>
      <section
      >
        <div
          className="container-fluid d-flex"
          style={{
            backgroundImage: `url(${nftbg})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            height: "300px",
          }}
        >
          <div className="display-5 fw-bold  my-auto mx-auto  w-50 ">
            Discover ,Collect and sell digital Art ,NFT collection
          </div>

          
        </div>
      </section>
    </>
  );
}
