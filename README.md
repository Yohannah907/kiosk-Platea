# Platea – Campus Food-Ordering Kiosk

A complete campus food-ordering solution built around your instructor's project structure:
- **Kiosk (`REACT + VITE`)** – 7 modular student ordering screens (`src/modules/`)
- **Kiosk Admin Design (`REACT + VITE`)** – Kitchen orders, live menu management, and test reporting (`src/admin/`)
- **Automated Test Scenario Using Selenium + Automated Reporting** – End-to-end Chrome WebDriver suite and HTML/JSON report generator (`selenium-tests/`)
- **Web API (`.NET 8, EF Core, SQL Server`)** – Backend REST API and database context (`webapi/`)

## Project Structure

```text
public/
  images/                         # Menu item and welcome hero imagery
src/
  admin/
    AdminDashboard.tsx            # Kiosk Admin Console (Orders, Menu CRUD, Test Report)
    TestReportViewer.tsx          # Automated test verification & HTML report export
  components/
    PlateaLogo.tsx                # Shared brand wordmark and back navigation
  data/
    menuData.ts                   # Menu catalog, categories, search keywords
  modules/
    WelcomePage.tsx               # Module 1: Welcome Page
    LoginPage.tsx                 # Module 2: Student Login Page
    MenuPage.tsx                  # Module 3: Menu & Category Filters + Search
    AddToCartModal.tsx            # Module 4: Add to Cart Confirmation Modal
    ViewCartPage.tsx              # Module 5: View the Cart & Order Summary
    BalanceRewardsPage.tsx        # Module 6: Balance & Rewards + Payment Method
    OrderSuccessPage.tsx          # Module 7: Order Success Confirmation
  services/
    api.ts                        # Optional .NET 8 Web API integration
  types/
    kiosk.ts                      # Shared TypeScript interfaces
  App.tsx
selenium-tests/
  package.json                    # selenium-webdriver dependency
  platea.selenium.mjs             # Automated Selenium test scenarios (Modules 1-7)
  reportGenerator.mjs             # Automated HTML & JSON Test Execution Reporter
webapi/
  Platea.Api.csproj               # .NET 8 Web API + EF Core SQL Server project
  Program.cs
  appsettings.json
  Data/PlateaDbContext.cs
  Models/
    MenuItem.cs
    Order.cs
    StudentAccount.cs
  Controllers/
    MenuController.cs
    OrdersController.cs
    StudentsController.cs
```

## Running Each Part Locally (VS Code)

### 1. Frontend Kiosk & Admin (`React + Vite`)
```bash
npm install
npm run dev
```
- Kiosk: `http://localhost:3000`
- Kiosk Admin Console: `http://localhost:3000/#admin` (or click **Kiosk Admin Console** on the Welcome Page)

### 2. Automated Selenium Tests & Reporting
With the Vite dev server running on `http://localhost:3000`:
```bash
cd selenium-tests
npm install
npm test
```
Or run headless:
```bash
npm run test:headless
```
After running, open the generated report at:
`selenium-tests/reports/test-execution-report.html`

### 3. `.NET 8 + EF Core + SQL Server` Web API
Requires **.NET 8 SDK** and **SQL Server / LocalDB**:
```bash
cd webapi
dotnet restore
dotnet run
```
To connect the React frontend to your running `.NET 8` API, create a `.env` file with:
```env
VITE_API_URL="http://localhost:5000"
```
