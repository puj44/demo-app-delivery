import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
const qrcodeRegionId = "reader";

const createConfig = (props) => {
    let config = {};
    if (props.fps) {
        config.fps = props.fps;
    }
    if (props.qrbox) {
        config.qrbox = props.qrbox;
    }
    if (props.aspectRatio) {
        config.aspectRatio = props.aspectRatio;
    }
    if (props.disableFlip !== undefined) {
        config.disableFlip = props.disableFlip;
    }
    return config;
};

const Html5QrcodePlugin = (props) => {

    useEffect(() => {
        const config = createConfig(props);
        const verbose = props.verbose === true;
        if (!(props.qrCodeSuccessCallback)) {
            throw "qrCodeSuccessCallback is required callback.";
        }
        const html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, {...config,supportedScanTypes:[Html5QrcodeScanType.SCAN_TYPE_CAMERA]}, false);
        html5QrcodeScanner.render((decodedText,decodedResult)=>{html5QrcodeScanner.clear(); props.qrCodeSuccessCallback(decodedText,decodedResult);}, props.qrCodeErrorCallback);
        
        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, []);
    if(props?.show){
        return (
            <Modal show={props?.show} onHide={props?.handleClose}>
            <Modal.Header closeButton>
              <Modal.Title style={{fontSize:"16px"}}>Scan Product Code</Modal.Title>
            </Modal.Header>
            <Modal.Body> <div id={qrcodeRegionId} style={{fontSize:"14px"}}></div></Modal.Body>
          </Modal>
           
        );
    }
};

export default Html5QrcodePlugin;