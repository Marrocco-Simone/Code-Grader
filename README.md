# Explanation of the app

By launching the app via the docker compose file, it is possible to submit and have graded code based on given assignments.

The commands to launch the application, both in prod and dev mode, are written in their sh files. Similar scripts to launch all the tests are aviable too.

The application is done following all 15 functionalities to pass with merits.

# Functionalities

For the frontend, the user id is created and stored in the localstorage. It is already written some default text in the code editor, to simplify testing the app. On loading, the current profile (current assignment and points) are fetched from the server and loaded. Once an assignment is completed, points are given and it is possible to go to the next assignment and 100 points are added to the total in the top bar (11). Once all are done, it is possible to reset all submission and start from zero. (1)

An user cannot submit code when another one is waiting grading. (10) Submitting the same code twice creates a new submission, but the result is copied from the previous one. (2) Both controls are done by the stateless programming server, which checks the database before submitting code to the grader.

Submissions are graded in a queue, one by one. (3) There are currently 2 graders that share the total load, but it is possible to modify this value from the docker file and test it to see the improvements. Since an user can only have one submission at a time, it cannot have multiple submissions or even the same one to different graders. (13)

The frontend uses long polling to check to updates (4). It checks every second for a maximum of 15 times, until a new version of the submission with the grading comes. The submission, when created, is cached in a Redis database and recovered in the polling API. When the grader sends the grading, the submission is updated, the cache is cleaned and the polling API fetches the new value for the db, so that the frontend stops asking and shows to the user with a toast notification (14). Assignments are also cached in a variable inside the server, since they dont change and it's faster to load.

All this functionalities are tested with Playwright (6). The point functionalities are also tested (12). Tests are launchable via a docker. The command to launch it is in _launch-playwright.sh_. Tests done with k6 to see how much it takes to load the page and how many submissions are sendable at the same time are aviable via docker in _launch-load-page-test.sh_ and _launch-submit-assignment-test.sh_ (7). Via docker it is possible to launch both the development and production versions (5), with their own files _launch-dev-servers.sh_ and _launch-prod-servers.sh_.

The application frontend is done in Astro, Svelte and Tailwind. The library SweetAlerts2 is used to show good alerts on events to the users (15).

There are explanations on the functionalities (this file) (8) and how to run everything (9).

# Future works

The calculations of current assignments and points are done by reading all the submissions, and users are created only by a single machine. We could add a login method so to have users with their own username, password and stored points and completed assignments.

An admin page could be made to create new assignments.

The application only works with docker, since all links are docker-compose specific. Putting this links in separated enviroment files could make the various parts deployable indipendently.

Since the application is docker specific and we are supposing no malign users, the checks that an user does not submit multiple assignments or the same in multiple graders are done in the programming api but not in the grader api. Adding these checks with a communication process between graders (for example having a specific programm for the queue management) could be done if necessary (or the connection to the grader could be limited from only the programming api servers)
