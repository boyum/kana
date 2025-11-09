# SOPS Setup Guide

This project uses [SOPS](https://github.com/getsops/sops) (Secrets OPerationS) with [age](https://github.com/FiloSottile/age) encryption to manage secrets securely.

## What's Configured

- **Encryption key**: Generated age keypair stored in `.sops/age-key.txt` (gitignored)
- **Configuration**: [.sops.yaml](.sops.yaml) defines which files are encrypted
- **Encrypted secrets**: [.secrets.env](.secrets.env) (you can commit this safely)

## Prerequisites

Install SOPS and age (if not already installed):

```bash
# macOS
brew install sops age

# Linux
# Download from releases:
# - https://github.com/getsops/sops/releases
# - https://github.com/FiloSottile/age/releases
```

## Daily Usage

### Set environment variable

Add this to your `~/.zshrc` or `~/.bashrc`:

```bash
export SOPS_AGE_KEY_FILE=/Users/sindreboyum/dev/personal/kana/.sops/age-key.txt
```

Or use direnv with an `.envrc` file:

```bash
export SOPS_AGE_KEY_FILE="$(pwd)/.sops/age-key.txt"
```

### Edit secrets

```bash
# Edit encrypted file (SOPS will decrypt, open editor, then re-encrypt)
sops .secrets.env

# Or use full command without env var
SOPS_AGE_KEY_FILE=.sops/age-key.txt sops .secrets.env
```

### View secrets (without editing)

```bash
sops -d .secrets.env
```

### Export secrets to shell

```bash
# Load secrets into current shell
export $(sops -d .secrets.env | xargs)

# Or create a helper script
echo 'export $(sops -d .secrets.env | xargs)' > load-secrets.sh
chmod +x load-secrets.sh
source ./load-secrets.sh
```

### Create new encrypted file

```bash
# SOPS will automatically encrypt based on .sops.yaml rules
sops secrets/production.secrets.env
```

## Team Setup

When a team member clones this repo:

1. Get the age private key securely (1Password, encrypted channel, etc.)
2. Save it to `.sops/age-key.txt`
3. Set `SOPS_AGE_KEY_FILE` environment variable
4. Can now decrypt/edit secrets with `sops .secrets.env`

## Production/CI Setup

For production environments:

```bash
# Set the age key as environment variable in your CI/CD
export SOPS_AGE_KEY="AGE-SECRET-KEY-1S9504VLQUJW0PUWP0WH5W7E6CM55956QTUM7HYAP46LJK445Q7AQ093WGG"

# Decrypt secrets in your deployment script
sops -d .secrets.env > .env
```

For Vercel/Netlify/other platforms:

1. Add `SOPS_AGE_KEY` to environment variables
2. In build command, decrypt secrets before build
3. Or manually copy decrypted values to platform's env var UI

## Key Rotation

If the key is compromised:

```bash
# Generate new keypair
age-keygen -o .sops/age-key-new.txt

# Update .sops.yaml with new public key
# Re-encrypt all files
sops updatekeys .secrets.env

# Securely share new key with team
# Delete old key
```

## Security Notes

- **Never commit** `.sops/age-key.txt` (it's gitignored)
- **Do commit** `.secrets.env` (it's encrypted)
- **Do commit** `.sops.yaml` (it's configuration only)
- The encrypted files are safe to put in git
- Share the private key securely with team members (1Password, etc.)

## Alternative: Multiple Keys

You can add multiple age keys to [.sops.yaml](.sops.yaml) so different team members can decrypt:

```yaml
creation_rules:
  - path_regex: \.secrets\.(yaml|yml|json|env)$
    age: >-
      age1p457szg3ukxh0nnhu08pr8nqcw6jk8hq8qhs5a3rkkj8w7uqtuwqc4tr38,
      age1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx,
      age1yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
```

## Resources

- [SOPS Documentation](https://github.com/getsops/sops)
- [age Documentation](https://github.com/FiloSottile/age)
- [Best Practices](https://github.com/getsops/sops#important-information-on-types)
