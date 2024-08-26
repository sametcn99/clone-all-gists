import { Octokit } from 'octokit'
import { input } from '@inquirer/prompts'
import { writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Prompt for GitHub token with validation
async function promptForGithubToken() {
  while (true) {
    try {
      const token = await input({
        message: 'Enter your GitHub token',
        validate: validateGithubToken,
        required: true,
        theme: { prompt: { primary: 'green' } },
      })

      if (token) return token
    } catch (error) {
      console.log('Invalid token, please try again.')
    }
  }
}

// Validate GitHub token by attempting to authenticate
async function validateGithubToken(token) {
  const octokit = new Octokit({ auth: token })
  try {
    await octokit.rest.users.getAuthenticated()
    return true
  } catch {
    return false
  }
}

// Prompt for GitHub username
async function promptForGithubUsername() {
  return input({
    message: 'Enter GitHub username',
    required: true,
    theme: { prompt: { primary: 'green' } },
  })
}

// Fetch gist content by URL
async function fetchGistContent(file) {
  const response = await fetch(file.raw_url)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch content from ${file.raw_url}: ${response.statusText}`
    )
  }
  return response.text()
}

// Save gist files to the filesystem
async function saveGistsToFilesystem(username, gists) {
  const userFolder = path.join(__dirname, 'output', username)
  mkdirSync(userFolder, { recursive: true })

  await Promise.all(
    gists.map(async (gist) => {
      const gistFolder = path.join(userFolder, gist.id)
      mkdirSync(gistFolder, { recursive: true })

      const saveFilePromises = Object.entries(gist.files).map(
        async ([filename, file]) => {
          const formattedFilename = filename.replace(/[^a-zA-Z0-9-_\.]/g, '_')
          const content = await fetchGistContent(file)
          const filePath = path.join(gistFolder, formattedFilename)
          writeFileSync(filePath, content)
        }
      )

      await Promise.all(saveFilePromises)
    })
  )

  console.log(`Total gists saved: ${gists.length}`)
}

// Fetch all gists for the given username
async function fetchAllUserGists(octokit, username, totalGists) {
  const totalPages = Math.ceil(totalGists / 100)
  const fetchPagePromises = Array.from({ length: totalPages }, (_, index) =>
    octokit.rest.gists
      .listForUser({
        username,
        per_page: 100,
        page: index + 1,
      })
      .catch((error) => {
        console.error(`Error fetching page ${index + 1}:`, error.message)
        return { data: [] } // Return an empty array for this page
      })
  )

  const pages = await Promise.all(fetchPagePromises)
  const allGists = pages.flatMap((page) => page.data)
  console.log(`Fetched ${allGists.length} gists in total for ${username}`)

  return allGists
}

// Main execution flow
async function main() {
  try {
    const token = await promptForGithubToken()
    const username = await promptForGithubUsername()

    const octokit = new Octokit({ auth: token })
    const { data: user } = await octokit.rest.users.getByUsername({
      username,
    })

    console.log(`Found user: ${user.name || user.login}`)
    const allGists = await fetchAllUserGists(
      octokit,
      username,
      user.public_gists
    )

    await saveGistsToFilesystem(username, allGists)
  } catch (error) {
    console.error('An error occurred:', error.message)
    process.exit(1)
  }
}

// Run the main function
main().catch((error) => {
  console.error('Unhandled error:', error.message)
  process.exit(1)
})
