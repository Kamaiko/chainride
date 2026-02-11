# ChainRide

Projet realise dans le cadre du cours IFT-4100 Concepts et applications de la chaine de blocs. ChainRide est une application decentralisee de location de voitures pair-a-pair sur Ethereum. Les proprietaires listent leurs vehicules avec un prix par jour, les locataires reservent et paient directement en ETH — sans intermediaire.

## Demarrage

1. Installer les dependances :

```bash
npm install                # racine (Hardhat)
cd frontend && npm install # frontend (React)
```

2. Copier `.env.example` → `.env` dans chaque racine et remplir les valeurs.
   L'adresse du contrat proxy UUPS sur Sepolia :
   [`0x2BCA7b901cEc9049EBCF2695Be33735BeDc7f748`](https://sepolia.etherscan.io/address/0x2BCA7b901cEc9049EBCF2695Be33735BeDc7f748)
   → a mettre dans `frontend/.env` sous `VITE_CONTRACT_ADDRESS`

3. Lancer :

```bash
npx hardhat test           # tests
cd frontend && npm run dev # frontend (localhost:5173)
```

## Comptes de test (Hardhat local)

Lors du lancement de `npx hardhat node`, ces comptes sont pre-finances avec 10 000 ETH chacun :

| Role | Adresse | Cle privee |
|------|---------|-----------|
| Locataire (deployer) | `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` | `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80` |
| Proprietaire | `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` | `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d` |

Importer ces cles dans MetaMask pour tester sur le reseau Hardhat (localhost:8545).

## Contrat

**V1** — Listing de voitures, location avec detection de chevauchement, restitution/annulation avec remboursement, retrait des gains.

**V2** — Depot de garantie configurable, penalite de retard (deduite du depot), frais de plateforme par location.

## Frontend

React 19 + TypeScript + Vite, wagmi/viem pour les interactions on-chain, RainbowKit pour la connexion wallet, Tailwind CSS v4, Framer Motion.
