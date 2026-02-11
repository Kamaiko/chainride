# Script — Video de demonstration ChainRide

> Enregistrement ecran uniquement (Win+Alt+R). Sous-titres a ajouter dans Clipchamp.
> Deux comptes MetaMask necessaires sur Sepolia : un proprietaire et un locataire.
> Avant de commencer : `frontend/.env` doit pointer sur l'adresse Sepolia.

---

## Scene 1 — Connexion et accueil (~30s)

**Actions :**
1. Ouvrir le frontend dans le navigateur (localhost:5173)
2. Cliquer "Connect Wallet" (RainbowKit) → MetaMask → compte Proprietaire
3. Montrer la page d'accueil : stats (nombre de voitures, reservations, version du contrat)

**Sous-titres :**
- "ChainRide — DApp de location de voitures sur Ethereum Sepolia"
- "Connexion via MetaMask au reseau Sepolia"
- "La version du contrat affichee (2.0.0) confirme l'upgrade V1 → V2"

---

## Scene 2 — Lister une voiture (~30s)

**Actions :**
1. Cliquer "List Car" (icone +) dans la navbar
2. Remplir le formulaire :
   - Brand : Toyota
   - Model : Corolla
   - Year : 2024
   - Daily Price : 0.001
3. Cliquer "List Car" → confirmer la transaction dans MetaMask
4. Attendre la confirmation (le formulaire se reinitialise)

**Sous-titres :**
- "Le proprietaire liste une voiture avec un prix de 0.001 ETH/jour"
- "La transaction est envoyee sur Sepolia et confirmee on-chain"

---

## Scene 3 — Changer de compte (~15s)

**Actions :**
1. Ouvrir MetaMask → switcher vers le compte Locataire
2. La page se met a jour automatiquement (adresse change dans le header)

**Sous-titres :**
- "On passe au compte du locataire pour effectuer une reservation"

---

## Scene 4 — Louer la voiture (~40s)

**Actions :**
1. Cliquer "Browse" dans la navbar
2. Cliquer sur la voiture Toyota Corolla
3. Sur la page de detail :
   - Selectionner une date de debut (demain ou apres-demain)
   - Selectionner une date de fin (2-3 jours apres)
   - Le prix total + depot s'affichent automatiquement
4. Cliquer "Rent Car" → confirmer dans MetaMask
5. Attendre la confirmation

**Sous-titres :**
- "Le locataire parcourt les voitures disponibles et selectionne des dates"
- "Le cout total inclut le prix de location + le depot de garantie (V2)"
- "Le paiement est envoye directement au contrat intelligent"

---

## Scene 5 — Retourner la voiture (~20s)

**Actions :**
1. Cliquer "My Rentals" dans la navbar
2. La reservation active est visible avec les dates et le statut
3. Cliquer "Return Car" → confirmer dans MetaMask
4. Le statut passe a "Ended"

**Sous-titres :**
- "Le locataire retourne la voiture depuis la page My Rentals"
- "Le depot est rembourse automatiquement (pas de retard dans ce cas)"

---

## Scene 6 — Retirer les gains (~20s)

**Actions :**
1. Ouvrir MetaMask → switcher vers le compte Proprietaire
2. Cliquer "My Listings" dans la navbar
3. Les gains accumules sont affiches en haut de la page
4. Cliquer "Withdraw" → confirmer dans MetaMask
5. Le solde retombe a 0

**Sous-titres :**
- "Le proprietaire retire ses gains via le pattern pull-over-push"
- "Les fonds sont transferes du contrat vers son portefeuille"

---

## Scene 7 — Preuve Etherscan (~20s)

**Actions :**
1. Ouvrir Etherscan dans un nouvel onglet : https://sepolia.etherscan.io/address/0x2BCA7b901cEc9049EBCF2695Be33735BeDc7f748
2. Montrer l'adresse du proxy, les transactions recentes
3. Optionnel : cliquer sur "Read as Proxy" → getVersion → "2.0.0"

**Sous-titres :**
- "Le contrat proxy UUPS est deploye sur Sepolia"
- "getVersion() retourne 2.0.0 — preuve de l'upgrade V1 → V2"

---

## Duree totale estimee : ~3 minutes

## Checklist avant enregistrement

- [ ] `frontend/.env` → adresse Sepolia (`0x2BCA7b...`)
- [ ] MetaMask sur le reseau Sepolia
- [ ] Deux comptes avec du Sepolia ETH
- [ ] Frontend demarre (`cd frontend && npm run dev`)
- [ ] Aucune voiture deja listee (etat propre) ou c'est OK d'en avoir
