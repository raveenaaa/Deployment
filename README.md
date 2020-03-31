# Deployment

In this workshop, we'll cover the basics of setting up a barebone deployment pipeline, in support of a green-blue deployment strategy.

*TODO:* Diagram for pipeline.

### Blue-green deployment

Text about blue-green deployment.

## Workshop

### Before you start

To start with, you'll need some files in this repo to help setup the blue-green infrastructure.

    git clone https://github.com/CSC-DevOps/Deployment.git
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

On your host computer, clone the [meow.io repo](https://github.com/CSC-DevOps/meow.io), and set the following remotes, using the ssh protocol:

    git clone https://github.com/CSC-DevOps/meow.io
    cd meow.io
    git remote add blue ssh://vagrant@192.168.44.25/home/vagrant/meow.io/blue.git
    git remote add green ssh://vagrant@192.168.44.30/home/vagrant/meow.io/green.git

You can now push changes in the following manner.

    GIT_SSH_COMMAND="ssh -i ~/.bakerx/insecure_private_key" 
    git push green master
    git push blue master

Here, by setting `GIT_SSH_COMMAND`, we are telling git to use our ssh key for connecting to the VM. For Windows 🔽, you will need to modify the command to use `set`, followed by a `&`: `set GIT_SSH_COMMAND=ssh -i ~/.bakerx/insecure_private_key & git push green master`

### Testing deployment

We can go into our blue environment, `bakerx ssh blue`, and start our server:

```
cd meow.io/blue-www
# Create database
node data/init.js
# Start web server
npm start
```

Visit http://192.168.44.25:3000 in your browser to see if meow.io is running!

Repeat the same for the green environment.

## Settting up Infrastructure

Currently, we can deploy changes to our VM, but we have nothing the regulates the control of traffic, nor which TARGET is active. We will set up our infrastructure to fully handle a deployment, including automatic failover.

![setup](img/meow-deploy.png)

### Task 1: Configure Proxy

We will be using our host environment coordinate our production environment with a proxy service. 
Complete the proxy service by adding a redirect from `localhost:3080` to our TARGET production endpoint.

```js
proxy.web( req, res, {target: self.TARGET } );
```
To activate, run `node index.js serve`. Visiting http://localhost:3080 should redirect you to the GREEN production environment.


### Task 2: Configure process supervisor

We want our environment to automatically restart the web server when a push is made.

Inside the blue environment, `bakerx ssh blue`, install forever:

```
sudo npm install forever -g
```

We will then append the following to our post-receive hook:

```bash
forever stopall
forever -w start ./bin/www
```

Repeat for the green environment.

##### Trigger hooks

We are going to amend our last commit, to enable us to push and trigger our post-receive hooks.

```
git commit --amend --no-edit
git push blue master -f
git push green master -f
```

Our forever process should now running our web server without us needing to manually stop or start it.

### Task 3: Add automatic failover

In case a bad commit is pushed to our green environment, we want a way to automatically direct traffic back to our stable `BLUE` environment.

We will accomplish this by adding a health monitor, which checks every 5 seconds if the GREEN environment has any failure. If failure does occur, then it will automatically switch the `TARGET` to the `BLUE` environment.

Update the `healthCheck()` function to perform the switch.

##### Commit bad commit, trigger failover, revert bad change

We will introduce a bad commit to the `GREEN` environment which should trigger our failure over.

Modify the index route in meow.io, to explicitly fail: `res.status(500).render(...`

```
$ git add index.js
$ git commit -m "bad commit"
$ git push green master
```

You should observe your failover being triggered---traffic should now be served from the `BLUE` environment.

We can use this chance to patch production and revert our bad commit:
```
$ git revert HEAD
[master 5edde92] Revert "bad commit"
 1 file changed, 1 insertion(+), 1 deletion(-)

$ git push green master
```

### Task 4: Flag

Notice that meow.io is not currently displaying any recent images. Set the value `RECENT=ON` inside the redis server on the `BLUE` environment.

![img/meow.io-off.png]

You should be able to see the feature turned on:

![img/meow.io-flag.png]

A feature flag can be a powerful tool to assist with deployment. It can be used to fence off new features or quickly turn off buggy features without needing to rollback a commit.

### Task 5: Sync


