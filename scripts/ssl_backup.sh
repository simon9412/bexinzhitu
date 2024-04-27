#!/bin/bash

# 源文件或目录路径
source_path1="/etc/letsencrypt"
source_path2="/var/log/letsencrypt"
source_path3="/var/lib/letsencrypt"

# 备份目标目录
backup_dir="/ssl_backup"

# 创建备份目录（如果不存在）
sudo mkdir -p "$backup_dir"

# 当前日期和时间作为备份文件名的一部分
backup_filename1="etc_backup_$(date +'%Y%m%d_%H%M%S').tar.gz"
backup_filename2="log_backup_$(date +'%Y%m%d_%H%M%S').tar.gz"
backup_filename3="lib_backup_$(date +'%Y%m%d_%H%M%S').tar.gz"

# 执行备份命令
sudo tar -czf "$backup_dir/$backup_filename1" "$source_path1"
sudo tar -czf "$backup_dir/$backup_filename2" "$source_path2"
sudo tar -czf "$backup_dir/$backup_filename3" "$source_path3"

# 检查备份是否成功
if [ $? -eq 0 ]; then
    echo "备份成功：$backup_dir/$backup_filename1"
    echo "备份成功：$backup_dir/$backup_filename2"
    echo "备份成功：$backup_dir/$backup_filename3"
else
    echo "备份失败"
fi