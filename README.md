# Clone All Gists

This script downloads all public gists for a specified GitHub user and saves them to the local filesystem. The gists are organized by username and gist ID.

## Features

- **Authentication:** Prompts for a GitHub token to authenticate API requests.
- **User Input:** Asks for the GitHub username whose gists will be downloaded.
- **File Management:** Automatically creates directories and saves gists by username and gist ID.
- **Robust Validation:** Validates the GitHub token by attempting to authenticate with it.

## Prerequisites

- bun.js installed on your machine.
- A valid GitHub token with the necessary permissions to access gists.

## Installation

1. Clone this repository to your local machine.

   ```bash
   git clone https://github.com/sametcn99/clone-all-gists
   cd clone-all-gists
   ```

2. Install the required dependencies.

   ```bash
   bun install
   ```

## Usage

1. Run the script:

   ```bash
   bun run start
   ```

2. When prompted, enter your GitHub token and the GitHub username whose gists you want to download.

3. The script will download all public gists for the specified user and save them in a folder named after the username.
