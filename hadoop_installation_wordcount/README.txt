HADOOP 3.3.6 — INSTALLATION + MAPREDUCE WORDCOUNT
=================================================

Contents
--------
1. installation_steps.txt     Complete Ubuntu VM setup, configuration, HDFS/YARN, and WordCount run.
2. config/                    Correct Hadoop XML configuration templates.
3. code/WordCount.java        Complete Java MapReduce WordCount program.
4. code/input.txt             Sample input.
5. code/WORDCOUNT_RUN.txt     Compile, package, upload, run, view, and rerun commands.

Target environment
------------------
- Ubuntu Linux VM
- Hadoop 3.3.6
- OpenJDK 11
- Single-node pseudo-distributed Hadoop setup
- Bash shell

Important
---------
- Run these commands inside the Ubuntu VM terminal, not Windows CMD.
- The guide assumes Hadoop is installed at $HOME/hadoop.
- In config/hdfs-site.xml and config/mapred-site.xml, replace /home/YOUR_USERNAME with
  the actual home path shown by: echo $HOME
- Set dfs.replication=1 for a single DataNode.
- Format the NameNode only on first setup. Do not format an existing cluster just to restart it.
- Hadoop's web interfaces are normally NameNode: http://localhost:9870 and ResourceManager:
  http://localhost:8088.
- This is a learning/lab configuration, not a production-secure Hadoop cluster.
