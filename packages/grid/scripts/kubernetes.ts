import { FilterOptions, K8SModel, KubernetesNodeModel, NetworkModel } from "../src";
import { config, getClient } from "./client_loader";
import { log } from "./utils";

async function main() {
    const grid3 = await getClient();

    // create network Object
    const n = new NetworkModel();
    n.name = "monNetwork";
    n.ip_range = "10.238.0.0/16";
    n.addAccess = true;

    const masterQueryOptions: FilterOptions = {
        cru: 2,
        mru: 2, // GB
        sru: 2,
        availableFor: grid3.twinId,
        farmId: 1,
    };

    const workerQueryOptions: FilterOptions = {
        cru: 1,
        mru: 1, // GB
        sru: 1,
        availableFor: grid3.twinId,
        farmId: 1,
    };

    // create k8s node Object
    const master = new KubernetesNodeModel();
    master.name = "master";
    master.node_id = +(await grid3.capacity.filterNodes(masterQueryOptions))[0].nodeId;
    master.cpu = 1;
    master.memory = 1024;
    master.rootfs_size = 0;
    master.disk_size = 1;
    master.public_ip = false;
    master.planetary = true;

    // create k8s node Object
    const worker = new KubernetesNodeModel();
    worker.name = "worker";
    worker.node_id = +(await grid3.capacity.filterNodes(workerQueryOptions))[0].nodeId;
    worker.cpu = 1;
    worker.memory = 1024;
    worker.rootfs_size = 0;
    worker.disk_size = 1;
    worker.public_ip = false;
    worker.planetary = true;

    // create k8s Object
    const k = new K8SModel();
    k.name = "testk8s";
    k.secret = "secret";
    k.network = n;
    k.masters = [master];
    k.workers = [worker];
    k.metadata = "";
    k.description = "test deploying k8s via ts grid3 client";
    k.ssh_key = config.ssh_key;

    // deploy
    const res = await grid3.k8s.deploy(k);
    log(res);

    // get the deployment
    const l = await grid3.k8s.getObj(k.name);
    log(l);

    // // delete
    // const d = await grid3.k8s.delete({ name: k.name });
    // log(d);

    await grid3.disconnect();
}

main();
