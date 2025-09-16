# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-09-15

### Added
- Conditional category field display in transaction forms (hidden for income, visible for expenses)
- Transaction detail view mode with improved UX for editing and deleting transactions
- Enhanced UI consistency across all pages with modern glassmorphism design
- User profile editing functionality with name update capability
- Balance hiding feature with eye icon toggle on dashboard and profile pages

### Changed
- Updated project version to 1.0.3 in package.json
- Improved transaction management flow with detail view before edit/delete actions
- Enhanced edit transaction page to hide category field when transaction type is income
- Updated UI components with consistent styling and improved responsiveness
- Modernized header designs across all pages with glassmorphism effects

### Fixed
- UI consistency issues with button styling across different pages
- Navigation bar styling with rounded top corners for better visual appeal
- Transaction card design with cleaner layout and improved user experience

## [1.0.2] - 2025-09-15

### Added
- New default expense category: "Rumah Tangga"
- Updated documentation to reflect new default category

### Changed
- Updated all references from "Uncategorized" to "Tanpa Kategori" for Indonesian localization
- Updated PRD.md and TODO.md to reflect current application state

### Fixed
- Consistency in category labeling across dashboard and transaction pages
- Localization of category-related messages in UI components

## [1.0.1] - 2025-09-15

### Changed
- Updated disabled choose category when adding a 'Pemasukan' transaction

### Fixed
- Bug filtering transactions by category

## [1.0.0] - 2025-09-10

### Added
- Initial release of Family Finance PWA application
- User authentication (registration, login)
- Transaction management (income/expense tracking)
- Category management with default categories (Makanan, Transportasi, Pendidikan, Hiburan)
- Dashboard with balance summary and monthly charts
- PWA support for offline access
- Responsive design for mobile and desktop