# ChainRide — Location d'autos decentralisee

DApp de location de voitures sur Ethereum, construite avec Solidity (contrats upgradeables UUPS) et React.

**Cours** : IFT-4100/7100 — Concepts et applications de la chaine de blocs, Universite Laval

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Smart contracts | Solidity 0.8.24, Hardhat, OpenZeppelin Upgradeable |
| Proxy pattern | UUPS (UUPSUpgradeable) |
| Front-end | React + Vite + TypeScript |
| Web3 | wagmi + viem + RainbowKit |
| Style | Tailwind CSS v4 |
| Reseau | Sepolia testnet |
| Wallet | MetaMask via RainbowKit |

## Structure du projet

```
TP3_officiel/
├── contracts/
│   ├── CarRentalV1.sol            # Contrat principal V1
│   └── CarRentalV2.sol            # Upgrade V2 (depot, penalites, frais)
├── scripts/
│   ├── deploy.ts                  # Deploiement V1 via proxy UUPS
│   └── upgrade.ts                 # Upgrade V1 → V2
├── test/
│   ├── CarRental.test.ts          # 10 tests fonctionnels V1
│   └── CarRentalUpgrade.test.ts   # Test upgrade V1 → V2
├── frontend/
│   └── src/
│       ├── components/            # Navbar, CarCard, NetworkGuard, TransactionStatus
│       ├── hooks/                 # Hooks wagmi (useCarRental.ts)
│       ├── lib/                   # ABI, config wagmi, utilitaires (dates, format, errors)
│       └── pages/                 # Home, Browse, CarDetail, ListCar, MyRentals, MyListings
├── hardhat.config.ts
├── .env.example
└── README.md
```

## Installation

```bash
# Cloner le depot
git clone https://github.com/Kamaiko/chainride.git
cd chainride

# Installer les dependances Hardhat
npm install

# Installer les dependances frontend
cd frontend
npm install
cd ..
```

## Compilation

```bash
npx hardhat compile
```

## Tests

```bash
npx hardhat test
```

11 tests doivent passer :
- 10 tests fonctionnels V1 (deploiement, listing, location, disponibilite, restitution, prix, chevauchement, paiement insuffisant, propre voiture, retrait gains)
- 1 test d'upgrade V1 → V2 (etat preserve + nouvelles fonctionnalites)

## Deploiement local

**Terminal 1** — Lancer le noeud Hardhat local :
```bash
npx hardhat node
```

**Terminal 2** — Deployer le contrat :
```bash
npx hardhat run scripts/deploy.ts --network localhost
```

Noter l'adresse proxy affichee (ex: `0xe7f1725E...`).

Pour upgrader vers V2 :
```bash
PROXY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 npx hardhat run scripts/upgrade.ts --network localhost
```

**Terminal 2** — Lancer le frontend :
```bash
cd frontend
npm run dev
```

Ouvrir http://localhost:5173 dans le navigateur.

### Configurer MetaMask pour le test local

1. Ajouter le reseau dans MetaMask :
   - Nom : `Hardhat Local`
   - URL RPC : `http://127.0.0.1:8545`
   - Chain ID : `31337`
   - Symbole : `ETH`
2. Importer un compte de test (cle privee affichee dans le terminal du noeud Hardhat)

## Deploiement Sepolia

### Prerequis

1. **MetaMask** : installer depuis https://metamask.io/download/
2. **Sepolia ETH** : obtenir gratuitement via https://sepoliafaucet.com/ ou https://faucets.chain.link/sepolia
3. **Compte Alchemy** : creer un compte gratuit sur https://dashboard.alchemy.com/ et obtenir une URL RPC Sepolia

### Configuration

Copier `.env.example` vers `.env` et remplir :

```
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/VOTRE_CLE
PRIVATE_KEY=votre_cle_privee_metamask
ETHERSCAN_API_KEY=votre_cle_etherscan (optionnel)
```

> **Important** : Ne jamais commit le fichier `.env`. Il est deja dans `.gitignore`.

### Deployer

```bash
# Deploy V1
npx hardhat run scripts/deploy.ts --network sepolia

# Noter l'adresse proxy, puis upgrade vers V2
PROXY_ADDRESS=0x... npx hardhat run scripts/upgrade.ts --network sepolia
```

### Configurer le frontend pour Sepolia

Creer `frontend/.env` :
```
VITE_CONTRACT_ADDRESS=0x_votre_adresse_proxy
VITE_WALLETCONNECT_PROJECT_ID=votre_id (optionnel)
VITE_SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/VOTRE_CLE
```

### Verification Etherscan (bonus)

```bash
npx hardhat verify --network sepolia ADRESSE_IMPLEMENTATION
```

## Adresses deployees

| Contrat | Adresse | Lien |
|---------|---------|------|
| Proxy (V2) | `0x2BCA7b901cEc9049EBCF2695Be33735BeDc7f748` | [Etherscan](https://sepolia.etherscan.io/address/0x2BCA7b901cEc9049EBCF2695Be33735BeDc7f748) |
| Implementation V1 | `0xA6a0D9E26f3431b9E2Fcdd961C26EF2cB119B346` | |
| Implementation V2 | `0xA6a0D9E26f3431b9E2Fcdd961C26EF2cB119B346` | |

## Architecture du contrat

### CarRentalV1

- **Listing** : n'importe qui peut lister une voiture (marque, modele, annee, prix/jour)
- **Location** : paiement en ETH, verification de chevauchement, remboursement de l'exces
- **Restitution** : le locataire retourne la voiture, la disponibilite est retablie
- **Annulation** : possible avant la date de debut (remboursement complet)
- **Retrait** : le proprietaire retire ses gains accumules (pattern pull-over-push)

### CarRentalV2 (upgrade)

- **Depot de garantie** : le proprietaire peut exiger un depot par voiture
- **Penalite de retard** : deduction automatique du depot en cas de retour tardif
- **Frais de plateforme** : pourcentage preleve sur chaque location
- **getVersion()** : retourne `"2.0.0"` (preuve d'upgrade)

### Securite

- `OwnableUpgradeable` : controle d'acces pour les fonctions admin
- `ReentrancyGuardUpgradeable` : protection contre la reentrance
- Custom errors : gestion d'erreurs gas-efficient
- Checks-Effects-Interactions : pattern applique systematiquement
- Storage gap (`uint256[44] __gap`) : reserve de slots pour les futures versions

## Video de demonstration

La video doit montrer :
1. Connexion du wallet MetaMask et affichage de l'adresse
2. Transaction complete : lister une voiture → louer → retourner
3. Preuve de deploiement : adresse proxy + page Etherscan
4. Preuve de l'upgrade V1 → V2 : `getVersion()` retourne `"2.0.0"`
