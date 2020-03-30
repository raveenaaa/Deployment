# Deployment

In this workshop, we'll cover the basics of setting up a barebone deployment pipeline, in support of a green-blue deployment strategy.

*TODO:* Diagram for pipeline.

### Blue-green deployment

Text about blue-green deployment.

## Workshop

### Before you start

To start with, you'll need some files in this repo to help setup the blue-green infrastructure.

    git clone https://github.com/CSC-DevOps/Deployment.git\
    cd Deployment
    npm install
    # Setup two virtual machines
    node index setup

### Setting up our Pipeline

We will first setup a basic pipeline that will have two deployment endpoints for our application.

### Initializing our deployment endpoints.

We'll create two endpoints for our deployment, a "green" endpoint for our baseline, and a "blue" endpoint for our new production code.

Inside green, `bakerx ssh green`, run:

```bash
mkdir -p meow.io/green.git meow.io/green-www
cd meow.io/green.git
git init --bare
```

Inside blue, `bakerx ssh blue`, run:

```bash
mkdir -p meow.io/blue.git meow.io/blue-www
cd meow.io/blue.git
git init --bare
```

##### Post-Receive Hook

Like our pipelines workshop, we will use a bare repository and a hook script to receive and checkout changes pushed to our bare repository.

Inside green, `bakerx ssh green`, create a hook file:

```bash
cd meow.io/green.git/hooks/
touch post-receive
chmod +x post-receive
```

Place the following content inside:

    GIT_WORK_TREE=/home/vagrant/meow.io/green-www git checkout -f
    cd /home/vagrant/meow.io/green-www && npm install

Repeat for blue.

### Deploying Commits and Copying Bits

Clone the [app repo](https://github.com/CSC-DevOps/App), and set the following remotes.  See help on [file protocol syntax](http://en.wikipedia.org/wiki/File_URI_scheme#Format).

    git remote add blue ssh://vagrant@192.168.44.25/home/vagrant/meow.io/blue.git
    git remote add green ssh://vagrant@192.168.44.30/home/vagrant/meow.io/green.git

You can now push changes in the following manner.

    GIT_SSH_COMMAND="ssh -i ~/.bakerx/insecure_private_key" git push green master
    GIT_SSH_COMMAND="ssh -i ~/.bakerx/insecure_private_key" git push blue master

Here, by setting `GIT_SSH_COMMAND`, we are telling git to use our ssh key for connecting to the VM.

### Testing deployment

Install a node process supervisor, globally, as needed by the demo, run:

    npm install -g forever

Then bring up the infrastructure:

    node infrastructure

When you first run it.  It will not work!  Notice that *-www, doesn't have any node_modules/ installed.  Think about some of the conceptual issues of deploying code versus a build.  For now, you can add into a hook, a step to run: "npm install".

You should be able to visit localhost:8080 and access the green slice!
In expanding on this concept, we could do the same exact steps, but on a different AWS instances, droplets, etc.

### Deploy a change.

Change the message to report, "Hello Blue".  

Push the change.

Test the blue server directly, using port 9090.

Notice, it hasn't updated yet...

You will need to modify how "forever" is run, by including a "--watch" flag which will restart the process if the file it is running changes.  Think carefully on where to place the flag.  You may also need to use "--watchDirectory" depending on where you have placed the deploy folders.

Push another change, "Hello Blue 2".  Now see if you can observe on the blue server.

### Add auto-switch over.

Have the default TARGET to be BLUE now.

Modify the app repo, to explicitly fail with : `res.status(500).send('Something broke!');`

Have a heartbeat that checks every 30 second for a http 500, and if so, will switch the proxy over to the green environment.

This idea can be generalized to be triggered by any other monitoring/alerts/automated testing (during staging). E.g., See how to use [toobusy](https://hacks.mozilla.org/2013/01/building-a-node-js-server-that-wont-melt-a-node-js-holiday-season-part-5/).


