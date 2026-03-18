#!/usr/local/bin/bash 

set -uo pipefail

read -r -p "Enter the branch name: " branch_name

if [ -z "$branch_name" ]; then
    echo "Branch name is required. Current branches:"
    git branch --format='%(refname:short)'
    exit 1
fi

# Check if branch exists
if ! git rev-parse --verify "$branch_name" >/dev/null 2>&1; then
    read -r -p "Branch $branch_name does not exist, create it? (y/n): " create_branch
    if [ "$create_branch" == "y" ]; then
        git checkout -b "$branch_name"
        git push -u origin "$branch_name"
    else
        exit 1
    fi
else
    git checkout "$branch_name"
fi

git fetch origin "$branch_name"

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$branch_name" 2>/dev/null || echo "$LOCAL")

if [ "$LOCAL" != "$REMOTE" ]; then
    echo "Local and Remote are out of sync."
    read -r -p "Do you want to rebase? (y/n). If no, we will merge: " rebase_choice
    if [ "$rebase_choice" == "y" ]; then
        git rebase "origin/$branch_name"
    else
        git merge "origin/$branch_name"
    fi
fi


git add .

read -r -p "Enter the commit message: " commit_message

COMMIT_COUNT=$(git rev-list --count HEAD)
git commit -m "Commit #$((COMMIT_COUNT + 1)): $commit_message" || echo "Nothing to commit"


git push origin "$branch_name" && echo "Pushed to origin $branch_name"