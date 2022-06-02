import React from "react";
import './UnsupportedDevice.css';

class UnsupportedDevice extends React.Component {
    render() {
        return (
            <div className="UnsupportedDevice">
                <div className="UnsupportedDevice__content">
                    <img className="UnsupportedDevice__logo" src={'/img/logo/dnero_wallet_logo@2x.png'}/>
                    <div className="UnsupportedDevice__title">
                        This wallet is currently designed for desktop use only.
                    </div>
                    {/* <a className="UnsupportedDevice__app-store-badge"
                       href="https://itunes.apple.com/app/dnero-wallet/id1451094550?mt=8"
                       target="_blank"
                    >
                        <img src="/img/badges/app-store@2x.png"/>
                    </a>
                    <a className="UnsupportedDevice__app-store-badge"
                       href="https://play.google.com/store/apps/details?id=org.dnero.wallet"
                       target="_blank"
                    >
                        <img src="/img/badges/google-play@2x.png"/>
                    </a> */}
                </div>
            </div>
        );
    }
}

export default UnsupportedDevice;
