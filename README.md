# ChainRide - Location d'autos decentralisee

**Cours** : IFT-4100/7100 — Concepts et applications de la chaine de blocs, Universite Laval
**Theme** : Location d'autos (option 3)
**Reseau** : Sepolia (Ethereum testnet)

## Stack

- **Contrats** : Solidity 0.8.24, Hardhat, OpenZeppelin Upgradeable (UUPS)
- **Frontend** : React + TypeScript + Vite, wagmi + viem, RainbowKit, Tailwind CSS v4

## Installation

```bash
npm install
cd frontend && npm install && cd ..
```

Copier `.env.example` vers `.env` et remplir les variables (cle privee, RPC URL).
Copier `frontend/.env.example` vers `frontend/.env` et remplir l'adresse du proxy.

## Compiler et tester

```bash
npx hardhat compile
npx hardhat test          # 11 tests (10 V1 + 1 upgrade V1->V2)
```

## Deployer sur Sepolia

```bash
# V1
npx hardhat run scripts/deploy.ts --network sepolia

# V2 (upgrade)
PROXY_ADDRESS=0x... npx hardhat run scripts/upgrade.ts --network sepolia
```

## Lancer le frontend

```bash
cd frontend
npm run dev               # http://localhost:5173
```

## Adresses deployees (Sepolia)

| Contrat | Adresse | Etherscan |
|---------|---------|-----------|
| Proxy (V2) | `0x2BCA7b901cEc9049EBCF2695Be33735BeDc7f748` | [Voir](https://sepolia.etherscan.io/address/0x2BCA7b901cEc9049EBCF2695Be33735BeDc7f748) |
| Implementation V1 | `0xA6a0D9E26f3431b9E2Fcdd961C26EF2cB119B346` | [Voir](https://sepolia.etherscan.io/address/0xA6a0D9E26f3431b9E2Fcdd961C26EF2cB119B346) |

## Fonctionnalites

### V1 — Contrat de base
- Lister une voiture (marque, modele, annee, prix journalier)
- Louer avec paiement en ETH et detection de chevauchement
- Retourner une voiture / annuler avant le debut
- Retrait des gains par le proprietaire (pull-over-push)

### V2 — Upgrade
- Depot de garantie configurable par voiture
- Penalite de retard (deduction automatique sur le depot)
- Frais de plateforme (pourcentage sur chaque location)
- `getVersion()` retourne `"2.0.0"`

### Securite
- `ReentrancyGuardUpgradeable`, `OwnableUpgradeable`
- Pattern Checks-Effects-Interactions, custom errors
- Storage gap pour compatibilite future

## Video de demonstration

La video montre :
1. Connexion MetaMask et affichage de l'adresse
2. Transaction complete : lister → louer → retourner → retirer les gains
3. Preuve de deploiement : adresse proxy sur Etherscan
4. Preuve d'upgrade : `getVersion()` = `"2.0.0"`
