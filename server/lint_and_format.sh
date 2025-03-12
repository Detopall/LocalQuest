# filepath: /home/denis/Desktop/projects/software-development/LocalQuest/server/lint_and_format.sh
#!/bin/bash

# Run flake8 to check for style violations
echo "Running flake8..."
flake8 --config=.flake8 .

# Run black to automatically format code
echo "Running black..."
black .

echo "Linting and formatting complete."
