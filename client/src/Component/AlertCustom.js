import React ,{useState} from 'react';
import { Alert, Modal} from 'react-bootstrap';


export default function AlertCustom({ eventInfo }) {
  const [show, setShow] = useState(true);
  const handleClose = () => {
    setShow(false);
  };

  return (
    <>
      <Modal show={show} onHide={handleClose}>
        <Alert variant="success" dismissable>
          <Modal.Header closeButton>
            <Modal.Title>
              <Alert.Heading>Campaign successfully created </Alert.Heading>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong> Created with address </strong>:{" "}
              {eventInfo?.CamapignAddress}
              <hr />
              <p>
                {" "}
                <strong> Raised by </strong> :{eventInfo?.CampaignCreater}{" "}
              </p>
              <p>
                {" "}
                <strong> title </strong> : {eventInfo?.Tittle}{" "}
              </p>
              <p>
                {" "}
                <strong> desc </strong> :
                <span
                  className="d-inline-block text-truncate"
                  style={{ maxWidth: "250px" }}
                >
                  {eventInfo?.Desc}
                </span>{" "}
              </p>
            </p>
          </Modal.Body>
        </Alert>
      </Modal>
    </>
  );
}

