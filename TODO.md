# TODO - Project error fixes

- [x] Inspect and fix Flask port conflict (keep dashboard/backend on :5000; change services/api_gateway.py off :5000)
- [x] Replace template main.py with proper entrypoint
- [x] Fix utils/feature_enginerring.py normalization divide-by-zero
- [x] Make utils/explainability.py safe for non-interactive/test runs (disable plotting by default)
- [x] Ensure tests pass: make loaders generate synthetic data when missing
- [x] Run `pytest -q` and iterate on any remaining failures


