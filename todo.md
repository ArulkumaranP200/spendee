# Spendee - Development TODO

## Completed Phases
- [x] Phase 1: Project scaffold and initialization
- [x] Phase 2: Data layer (types, storage, context, utils)
- [x] Phase 3: System lock screen (biometric + PIN)
- [x] Phase 4: Icon mappings, tab layout, and theme

## In Progress / Remaining

### Phase 5: Dashboard Screen
- [ ] Summary cards (Balance, Income, Expenses, Unpaid, Ledger Position)
- [ ] SVG donut chart for category breakdown
- [ ] Exclude Payments button and multi-select sheet
- [ ] Saved exclusion sets chip row
- [ ] Recent activity feed (transactions + ledger entries)
- [ ] Month/period selector

### Phase 6: Transactions Screen
- [ ] Segmented control (All / Paid / Unpaid)
- [ ] FlatList with transactions
- [ ] Search bar and filter chips
- [ ] Expandable split rows
- [ ] Swipe/long-press delete with confirmation
- [ ] Tap to edit navigation

### Phase 7: Add/Edit Transaction Screen
- [ ] Amount input (numeric keyboard)
- [ ] Type toggle (income/expense)
- [ ] Category picker
- [ ] Date picker
- [ ] Note text input
- [ ] Split toggle with dynamic line items
- [ ] Payment status selector
- [ ] Live sum validation for splits

### Phase 8: Credit & Debit Ledger Screen
- [ ] Top segment (Credit / Debit)
- [ ] Summary bar with totals and net position
- [ ] FlatList of ledger entries
- [ ] Status badge and progress bar
- [ ] Quick actions (Mark Settled, Add Partial Payment)
- [ ] Add/Edit ledger entry form

### Phase 9: Budgets Screen
- [ ] Budget cards with progress bars
- [ ] Add/edit budget modal
- [ ] Budget list FlatList
- [ ] Delete budget with confirmation

### Phase 10: Settings Screen
- [ ] Currency symbol input
- [ ] Theme selector (Light / Dark / System)
- [ ] Export data as JSON
- [ ] Clear all data with two-step confirmation
- [ ] Lock settings configuration (enable/disable, method selection)

### Phase 11: Polish & Delivery
- [ ] Haptic feedback on primary actions
- [ ] Empty-state messages for all lists
- [ ] Loading/error states
- [ ] End-to-end flow verification
- [ ] App icon and splash screen assets
- [ ] Final checkpoint and delivery

## Key Features Status

### Transactions
- [ ] Add transaction
- [ ] Edit transaction
- [ ] Delete transaction
- [ ] Split transaction support
- [ ] Payment status tracking (paid/unpaid)
- [ ] Category assignment
- [ ] Date tracking

### Credit & Debit Ledger
- [ ] Add credit entry (money lent)
- [ ] Add debit entry (money borrowed)
- [ ] Track settlement status
- [ ] Partial payment recording
- [ ] Mark as settled

### Budgets
- [ ] Create budget per category
- [ ] Edit budget
- [ ] Delete budget
- [ ] Progress tracking

### Exclude Payments
- [ ] Multi-select transactions
- [ ] Live summary recalculation
- [ ] Save exclusion sets
- [ ] Apply saved sets
- [ ] Delete exclusion sets

### System Lock
- [ ] Biometric authentication (Face ID / Fingerprint)
- [ ] PIN authentication
- [ ] Lock settings configuration
- [ ] Session tracking

## Testing Checklist
- [ ] All buttons functional (no dead ends)
- [ ] Core user flows end-to-end
- [ ] Data persistence across app restarts
- [ ] Offline functionality verified
- [ ] No console errors on iOS/Android/Web
- [ ] Responsive layout on different screen sizes
- [ ] Haptic feedback working
- [ ] Lock screen working correctly

## Known Issues / Notes
- None yet

## Next Steps
1. Build Dashboard screen with summary cards and Exclude Payments feature
2. Build Transactions screen with search and filter
3. Build Add/Edit Transaction screen with split support
4. Build Ledger screen with settlement tracking
5. Build Budgets and Settings screens
6. Polish and verify all flows
7. Create final checkpoint and deliver
