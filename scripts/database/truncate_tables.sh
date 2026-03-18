#!/usr/local/bin/bash 

current_dir=$(pwd)


cd "/Users/arryuannkhanna/interviewsta-backend/scripts/database" || exit
source ./index.sh

PERFORMANCE_TABLES=(
    "feedbacks"
    "user_parent_interview_scores"
    "user_parent_interview_weekly_scores"
)

echo -ne "${YELLOW}What tables do you want to truncate? (1. Performance tables, 2. All tables, 3. Others): ${NC}"
read -r option

case $option in
    1) 
        for table in "${PERFORMANCE_TABLES[@]}"; do
            print_info "Truncating $table"
            psql -h "$(get_db_host)" -p "$(get_db_port)" -U "$(get_db_username)" -d "$(get_db_name)" -c "TRUNCATE \"$table\" RESTART IDENTITY CASCADE" && print_success "Truncated $table" || print_error "Failed to truncate $table"
        done
        ;;
    2)
        print_info "Truncating all performance tables..."
        psql -h "$(get_db_host)" -p "$(get_db_port)" -U "$(get_db_username)" -d "$(get_db_name)" -c "TRUNCATE \"feedbacks\", \"user_parent_interview_scores\", \"user_parent_interview_weekly_scores\" RESTART IDENTITY CASCADE" && print_success "Successfully wiped database" || print_error "Failed to truncate tables"
        ;;
    3)
        echo -e "${BLUE}Enter table names separated by commas (e.g. users,posts):${NC}"
        IFS=',' read -r -a table_names
        for table in "${table_names[@]}"; do
            table=$(echo "$table" | xargs)
            print_info "Truncating $table"
            psql -h "$(get_db_host)" -p "$(get_db_port)" -U "$(get_db_username)" -d "$(get_db_name)" -c "TRUNCATE \"$table\" RESTART IDENTITY CASCADE" && print_success "Truncated $table" || print_error "Failed to truncate $table"
        done
        ;;
    *)
        print_error "Invalid option selected"
        ;;
esac 

cd "$current_dir"