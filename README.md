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

## Contrat

**V1** — Listing de voitures, location avec detection de chevauchement, restitution/annulation avec remboursement, retrait des gains.

**V2** — Depot de garantie configurable, penalite de retard (deduite du depot), frais de plateforme par location.

## Frontend

React 19 + TypeScript + Vite, wagmi/viem pour les interactions on-chain, RainbowKit pour la connexion wallet, Tailwind CSS v4, Framer Motion.
