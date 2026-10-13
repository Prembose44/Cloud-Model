package org.cloudbus.cloudsim.examples;

import org.cloudbus.cloudsim.*;
import org.cloudbus.cloudsim.core.CloudSim;
import java.util.*;

public class BasicResourceAllocation {
    public static void main(String[] args) throws Exception {
        CloudSim.init(1, Calendar.getInstance(), false);

        // Create Host
        List<Pe> peList = new ArrayList<>();
        peList.add(new Pe(0, new PeProvisionerSimple(1000)));

        List<Host> hostList = new ArrayList<>();
        hostList.add(new Host(0,
                new RamProvisionerSimple(2048),
                new BwProvisionerSimple(10000),
                1000000, peList,
                new VmSchedulerTimeShared(peList)));

        // Create Datacenter
        DatacenterCharacteristics dc = new DatacenterCharacteristics(
                "x86", "Linux", "Xen", hostList,
                10.0, 3.0, 0.05, 0.001, 0.0);

        new Datacenter("Datacenter_0", dc,
                new VmAllocationPolicySimple(hostList),
                new LinkedList<Storage>(), 0);

        // Create Broker
        DatacenterBroker broker = new DatacenterBroker("Broker");
        int brokerId = broker.getId();

        // Create 2 VMs
        List<Vm> vmList = new ArrayList<>();
        for (int i = 0; i < 2; i++) {
            vmList.add(new Vm(i, brokerId, 500, 1,
                    512, 1000, 10000, "Xen",
                    new CloudletSchedulerTimeShared()));
        }
        broker.submitVmList(vmList);

        // Create 2 Cloudlets
        List<Cloudlet> cloudletList = new ArrayList<>();
        UtilizationModel model = new UtilizationModelFull();
        for (int i = 0; i < 2; i++) {
            Cloudlet c = new Cloudlet(i, 10000, 1,
                    300, 300, model, model, model);
            c.setUserId(brokerId);
            cloudletList.add(c);
        }
        broker.submitCloudletList(cloudletList);

        // Run Simulation
        CloudSim.startSimulation();
        CloudSim.stopSimulation();

        // Print Results
        for (Cloudlet c : broker.getCloudletReceivedList()) {
            System.out.println("Cloudlet " + c.getCloudletId()
                    + " | Status: "
                    + (c.getStatus() == Cloudlet.SUCCESS ? "SUCCESS" : "FAILED")
                    + " | VM: " + c.getVmId());
        }
    }
}
