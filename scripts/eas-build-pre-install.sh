#!/bin/bash

echo "Pre-install hook: Setting npm configuration for legacy peer deps"

# Set npm to use legacy peer deps to avoid dependency conflicts
npm config set legacy-peer-deps true

# Increase memory limit for Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

echo "Pre-install configuration complete"