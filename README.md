# ZK K6 Operator - Load testing

## Summary -

This repo installs the official K6 Operator [repo](https://github.com/grafana/k6-operator) and triggers a test run.

Run the Start k6 run from the actions tab, this does 3 things

- Installs k6-operator optionally, do this only for the first time you're setting up a cluster, otherwise keep the k6-operator-install input as false.
- Installs the custom helm charts written for this repo - which includes
  - 1 configmap - with all the test scripts (scenarios) - status,inventory etc - these scripts have to be inside the helm charts folder for helm to be able to access them while deploying.
  - 1 custom resource Testrun which passes the instructions of the test onto the k6 operator, this includes the custom inputs that we can pass on to run the test, including -
    - K6 Script - this is the scenario you want to run (status.js, inventory.js) - be sure to include .js in the input.
    - K6 Stages - this is the duration string for k6 to run the test. Format - <duration(0-9|s,m,h)>\_<target>-<repeat> duration is the duration of the stage and target is the number of iterations you want K6 to hit on a per second basis. example - 10s_10000-20s_12000 will run for 30 seconds, first 10 seconds it will try and run 10k/sec and then 20k/sec for the remainder.
    - K6 VUs - this is the amount of virtual users you want to use in your test, each VU will run X amount of iterations to reach target set above.
    - K6 Start rate - this is the rate you want to start the test with (per second)
    - Pod count - how many pods you want operator to spawn and run the test
    - cluster - the cluster you want to run the test on

The action uninstalls the existing helm chart and then runs the install command to spin up new charts.
