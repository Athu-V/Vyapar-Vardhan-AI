# Setup & Test Instructions

## 1. Install dependencies

```bash
npm install
```

This will install `better-sqlite3` (added to `package.json`) along with all other dependencies.

## 2. Verify TypeScript compiles

```bash
npx tsc --noEmit
```

Expected: no errors. The new files (`src/lib/data/db.ts`, `src/lib/engine/financial.test.ts`) should typecheck cleanly.

## 3. Run the financial engine tests

### Option A: with Jest (recommended)

Install Jest:

```bash
npm install --save-dev jest ts-jest @types/jest
```

Create `jest.config.js`:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
}
```

Run:

```bash
npx jest src/lib/engine/financial.test.ts
```

### Option B: quick manual verification

Run a quick smoke test in Node:

```bash
node -e "
const { calculateEMI, calculatePostMoratoriumEMI, calculateDSCR } = require('./src/lib/engine/financial');

// Basic sanity checks
const emi = calculateEMI(100000, 8.0, 5);
console.log('EMI for 1L @ 8% 5yr:', emi, '(expected ~2028)');
console.assert(emi === 2028, 'EMI mismatch');

const postMortem = calculatePostMoratoriumEMI(1000000, 8.0, 7, 6);
const regular = calculateEMI(1000000, 8.0, 7);
console.log('Post-moratorium EMI:', postMortem, 'vs regular:', regular);
console.assert(postMortem > regular, 'Post-moratorium should be higher');

const dscr = calculateDSCR(1200000, 180000);
console.log('DSCR:', dscr, '(expected 6.67)');
console.assert(dscr === 6.67, 'DSCR mismatch');

console.log('All checks passed!');
"
```

## 4. Verify the persistence layer

```bash
node -e "
const { saveBusinessProfile, getBusinessProfile, saveMonthlyEntry, getMonthlyEntries, closeDatabase } = require('./src/lib/data/db');

// Create a test profile
saveBusinessProfile({
  id: 'test-1',
  name: 'Test Business',
  location: { village: 'Ramgarh', block: 'Sadar', district: 'Lucknow', state: 'UP' },
  category: 'retail',
  isExistingBusiness: true,
  monthlyRevenue: 80000,
  monthlyCOGS: 50000,
  monthlyOperatingExpenses: 12000,
  availableMarginCapital: 100000,
  singleBuyerDependency: false,
  createdAt: new Date(),
});

const profile = getBusinessProfile('test-1');
console.log('Profile found:', profile !== null);
console.assert(profile.name === 'Test Business', 'Profile name mismatch');

// Add a monthly entry
saveMonthlyEntry({
  id: 'entry-1',
  businessId: 'test-1',
  month: '2026-01',
  revenue: 85000,
  cogs: 52000,
  operatingExpenses: 12000,
  emiPaid: 14000,
  emiDue: 14000,
  singleBuyerRevenue: 60000,
  capturedVia: 'manual',
  capturedAt: new Date(),
});

const entries = getMonthlyEntries('test-1');
console.log('Entries found:', entries.length);
console.assert(entries.length === 1, 'Should have 1 entry');

closeDatabase();
console.log('Persistence layer verified!');
"
```

## Notes

- `better-sqlite3` is a native module — it requires a C++ build toolchain on first install (node-gyp). On Windows, ensure you have the [Windows Build Tools](https://github.com/felixrieseberg/windows-build-tools) or Visual Studio C++ tools installed.
- The database file is created at `./data/rural-advisory.db` (ignored by `.gitignore`).
- The financial tests in `src/lib/engine/financial.test.ts` are written in Jest format but can be adapted to any test runner.
