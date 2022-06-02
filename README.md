## Dnero Wallet for Web

Reference implementation of the Dnero Web Wallet. In addition to the standard wallet functionalities like sending and receiving Dnero/DToken, it also allows the user to deploy and interact with smart contracts running on the Dnero blockchain. To see the Dnero Web Wallet in action, please visit [https://wallet.dnerochain.org/](https://wallet.dnerochain.org/).

### Setup

```yarn install```

```yarn upgrade```

### Development

```yarn start```

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### Ledger development

Ledger's transports require https which makes local development difficult. Run a proxy in development.

```
mitmdump -p 443 --mode reverse:http://localhost:3000/
```


### Production

```yarn build```

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>

### License

The Dnero Web Wallet reference implementation is licensed under the [GNU License](./LICENSE).
