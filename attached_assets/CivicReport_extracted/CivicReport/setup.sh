#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Civic Report Setup Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if Node.js is installed
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "  Download from: https://nodejs.org"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}✗ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"
echo -e "${GREEN}✓ npm $(npm -v) found${NC}"
echo ""

# Create .env files if they don't exist
echo "Setting up environment files..."

if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo -e "${YELLOW}⚠ Created server/.env${NC}"
    echo -e "${YELLOW}  TODO: Update with your MongoDB URI, JWT_SECRET, and Cloudinary credentials${NC}"
    echo ""
fi

if [ ! -f "client/.env.local" ]; then
    cp client/.env.example client/.env.local
    echo -e "${YELLOW}⚠ Created client/.env.local${NC}"
    echo ""
fi

# Install dependencies
echo "Installing dependencies..."
echo ""

echo -e "${BLUE}Installing server dependencies...${NC}"
cd server
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Server dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install server dependencies${NC}"
    exit 1
fi
cd ..
echo ""

echo -e "${BLUE}Installing client dependencies...${NC}"
cd client
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Client dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install client dependencies${NC}"
    exit 1
fi
cd ..
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Setup Complete! ✓${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Configure environment variables:"
echo -e "   ${YELLOW}server/.env${NC} - Add MongoDB URI, JWT_SECRET, Cloudinary credentials"
echo ""
echo "2️⃣  Start the backend server:"
echo -e "   ${BLUE}cd server && npm run dev${NC}"
echo ""
echo "3️⃣  Start the frontend (in another terminal):"
echo -e "   ${BLUE}cd client && npm run dev${NC}"
echo ""
echo "4️⃣  Open in your browser:"
echo -e "   ${BLUE}http://localhost:5173${NC}"
echo ""
echo "📚 See SETUP_AND_DEPLOYMENT.md for detailed instructions"
echo ""
