# ChainRide — Taches restantes

## Phase 1 : Test manuel complet (localhost)

- [ ] Page d'accueil : stats (0/0/2.0.0), liens fonctionnels
- [ ] Lister auto (Account 1) : form → MetaMask → confirm → form reset → stats MAJ
- [ ] Browse : carte visible, lien vers detail
- [ ] Car detail (Account 1 = owner) : message "proprietaire", pas de form louer
- [ ] Car detail (Account 2) : form louer, calcul prix, bouton actif
- [ ] Louer (Account 2) : dates valides → MetaMask → confirm → form reset
- [ ] Mes locations (Account 2) : reservation active, boutons Retourner/Annuler
- [ ] Annuler dans MetaMask → bouton re-cliquable (test reset())
- [ ] Retourner → confirm → reservation "Terminee"
- [ ] Mes annonces (Account 1) : voiture listee, gains affiches
- [ ] Toggle Desactiver/Activer → feedback par carte
- [ ] Retirer gains → balance MAJ
- [ ] Browse apres desactivation : badge inactive visible

---

## Phase 2 : Code cleanup (DRY)

- [ ] **2A** `hooks/useCarRental.ts` — Factory `createWriteHook()` pour les 7 write hooks
- [ ] **2B** `components/StatusBadge.tsx` — Extraire badge actif/inactif reutilisable
- [ ] **2C** `lib/contracts.ts` — Extraire `filterResults<T>()` helper
- [ ] **2D** `lib/constants.ts` — DEFAULT_YEAR dynamique, DEFAULT_DAILY_PRICE
- [ ] **2E** `CarDetailPage.tsx` — `min={today}` sur les date pickers

---

## Phase 3 : Redesign UI complet

- [ ] Appliquer `/vercel-react-best-practices`
- [ ] **3A** Navbar : blur backdrop, logo gradient, hamburger mobile, active link animate
- [ ] **3B** HomePage : hero gradient, stats avec icones SVG, feature cards polies
- [ ] **3C** CarCard : hover effect, bandeau couleur, prix prominent, badge animate
- [ ] **3D** BrowseCarsPage : header compteur, skeleton shimmer, empty state
- [ ] **3E** CarDetailPage : layout 2 colonnes, summary box, bouton gradient
- [ ] **3F** ListCarPage : card centree, labels icones, focus states, success toast
- [ ] **3G** MyRentalsPage : timeline visuel, status badges, boutons icones
- [ ] **3H** MyListingsPage : earnings banner gradient, toggle switch, CTA visible
- [ ] **3I** Performance : React.memo(CarCard), useMemo contracts, React.lazy pages

---

## Phase 4 : Tests Hardhat supplementaires

- [ ] **4A** `package.json` — Ajouter script `"test": "hardhat test"`
- [ ] **4B** Tests `updateCar()` : modifier prix, toggle actif, owner-only
- [ ] **4C** Edge cases : prix 0, annee invalide, dates identiques
- [ ] **4D** V2 : retour en retard + penalite, depot rembourse, frais plateforme
- [ ] **4E** Extraire `futureDayTimestamp()` dans `test/helpers.ts`

---

## Phase 5 : Finalisation

- [ ] `npx hardhat test` — tous les tests passent
- [ ] `cd frontend && npm run build` — zero erreur
- [ ] Remettre `.env` Sepolia (pas localhost) pour demo
- [ ] Commit + push GitHub
- [ ] Video de demo (manuel, 15% de la note)
