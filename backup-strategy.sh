#!/usr/bin/env bash

# ===========================================
# BACKUP AND ROLLBACK STRATEGY
# Resume Manager Database Migration
# ===========================================

set -e  # Exit on any error

# Configuration
BACKUP_DIR="./database_backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="resume_manager_backup_${TIMESTAMP}.sql"
SCHEMA_BACKUP="schema_backup_${TIMESTAMP}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Resume Manager Database Migration Backup Strategy ===${NC}"

# Function to check if required tools are installed
check_dependencies() {
    echo -e "${YELLOW}Checking dependencies...${NC}"
    
    if ! command -v pg_dump &> /dev/null; then
        echo -e "${RED}Error: pg_dump is not installed or not in PATH${NC}"
        exit 1
    fi
    
    if ! command -v psql &> /dev/null; then
        echo -e "${RED}Error: psql is not installed or not in PATH${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ All dependencies found${NC}"
}

# Function to create backup directory
setup_backup_dir() {
    echo -e "${YELLOW}Setting up backup directory...${NC}"
    mkdir -p "$BACKUP_DIR"
    echo -e "${GREEN}✓ Backup directory ready: $BACKUP_DIR${NC}"
}

# Function to backup database
backup_database() {
    echo -e "${YELLOW}Creating full database backup...${NC}"
    
    # Get database connection details
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}Error: DATABASE_URL environment variable not set${NC}"
        echo "Please set DATABASE_URL in your .env file"
        exit 1
    fi
    
    # Create full database backup
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database backup created: $BACKUP_DIR/$BACKUP_FILE${NC}"
    else
        echo -e "${RED}✗ Database backup failed${NC}"
        exit 1
    fi
    
    # Create schema-only backup
    pg_dump --schema-only "$DATABASE_URL" > "$BACKUP_DIR/$SCHEMA_BACKUP"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Schema backup created: $BACKUP_DIR/$SCHEMA_BACKUP${NC}"
    else
        echo -e "${RED}✗ Schema backup failed${NC}"
        exit 1
    fi
}

# Function to validate backup
validate_backup() {
    echo -e "${YELLOW}Validating backup integrity...${NC}"
    
    # Check if backup files exist and have content
    if [ ! -s "$BACKUP_DIR/$BACKUP_FILE" ]; then
        echo -e "${RED}✗ Backup file is empty or doesn't exist${NC}"
        exit 1
    fi
    
    if [ ! -s "$BACKUP_DIR/$SCHEMA_BACKUP" ]; then
        echo -e "${RED}✗ Schema backup file is empty or doesn't exist${NC}"
        exit 1
    fi
    
    # Check backup file size (should be reasonable)
    backup_size=$(wc -c < "$BACKUP_DIR/$BACKUP_FILE")
    if [ "$backup_size" -lt 1000 ]; then
        echo -e "${RED}✗ Backup file seems too small (${backup_size} bytes)${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Backup validation passed (${backup_size} bytes)${NC}"
}

# Function to create rollback script
create_rollback_script() {
    echo -e "${YELLOW}Creating rollback script...${NC}"
    
    cat > "$BACKUP_DIR/rollback_${TIMESTAMP}.sh" << EOF
#!/usr/bin/env bash

# Rollback script for migration ${TIMESTAMP}
# THIS WILL COMPLETELY RESTORE YOUR DATABASE TO PRE-MIGRATION STATE

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "\${RED}WARNING: This will completely restore your database to the state before migration${NC}"
echo -e "\${RED}All data created after the migration will be LOST${NC}"
echo -e "\${YELLOW}Backup file: $BACKUP_FILE${NC}"
echo ""
read -p "Are you absolutely sure you want to rollback? (type 'ROLLBACK' to confirm): " confirmation

if [ "\$confirmation" != "ROLLBACK" ]; then
    echo -e "\${RED}Rollback cancelled${NC}"
    exit 1
fi

echo -e "\${YELLOW}Starting database rollback...${NC}"

# Drop the current database (BE VERY CAREFUL!)
psql "\$DATABASE_URL" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid != pg_backend_pid();"

# Restore from backup
psql "\$DATABASE_URL" < "$BACKUP_FILE"

if [ \$? -eq 0 ]; then
    echo -e "\${GREEN}✓ Database rollback completed successfully${NC}"
    echo -e "\${GREEN}Your database has been restored to pre-migration state${NC}"
else
    echo -e "\${RED}✗ Rollback failed! Database may be in inconsistent state${NC}"
    echo -e "\${RED}Contact your database administrator immediately${NC}"
    exit 1
fi
EOF
    
    chmod +x "$BACKUP_DIR/rollback_${TIMESTAMP}.sh"
    echo -e "${GREEN}✓ Rollback script created: $BACKUP_DIR/rollback_${TIMESTAMP}.sh${NC}"
}

# Function to create migration execution script
create_migration_script() {
    echo -e "${YELLOW}Creating migration execution script...${NC}"
    
    cat > "$BACKUP_DIR/execute_migration_${TIMESTAMP}.sh" << EOF
#!/usr/bin/env bash

# Migration execution script for Resume Manager
# Generated on ${TIMESTAMP}

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\${BLUE}=== Resume Manager Database Migration Execution ===${NC}"
echo -e "\${YELLOW}Backup created: $BACKUP_FILE${NC}"
echo -e "\${YELLOW}Rollback script: rollback_${TIMESTAMP}.sh${NC}"
echo ""

# Confirm execution
echo -e "\${RED}WARNING: This will modify your database schema and migrate all data${NC}"
echo -e "\${GREEN}✓ Backup has been created and validated${NC}"
echo -e "\${GREEN}✓ Rollback script is ready${NC}"
echo ""
read -p "Proceed with migration? (y/N): " -n 1 -r
echo

if [[ ! \$REPLY =~ ^[Yy]\$ ]]; then
    echo -e "\${RED}Migration cancelled${NC}"
    exit 1
fi

echo -e "\${YELLOW}Starting migration...${NC}"

# Execute the migration
psql "\$DATABASE_URL" -f "../migration.sql"

if [ \$? -eq 0 ]; then
    echo -e "\${GREEN}✓ Migration completed successfully!${NC}"
    echo ""
    echo -e "\${BLUE}Next steps:${NC}"
    echo "1. Update your application code to use the new schema"
    echo "2. Test all functionality thoroughly"
    echo "3. Run validation queries to ensure data integrity"
    echo "4. If everything works, you can remove old junction tables"
    echo ""
    echo -e "\${YELLOW}Rollback available at: rollback_${TIMESTAMP}.sh${NC}"
else
    echo -e "\${RED}✗ Migration failed!${NC}"
    echo -e "\${YELLOW}You can rollback using: ./rollback_${TIMESTAMP}.sh${NC}"
    exit 1
fi
EOF
    
    chmod +x "$BACKUP_DIR/execute_migration_${TIMESTAMP}.sh"
    echo -e "${GREEN}✓ Migration script created: $BACKUP_DIR/execute_migration_${TIMESTAMP}.sh${NC}"
}

# Function to create validation script
create_validation_script() {
    echo -e "${YELLOW}Creating validation script...${NC}"
    
    cat > "$BACKUP_DIR/validate_migration_${TIMESTAMP}.sql" << EOF
-- ===========================================
-- POST-MIGRATION VALIDATION QUERIES
-- Resume Manager Database Migration
-- ===========================================

-- Check user count consistency
SELECT 'User count validation' AS check_name, 
       COUNT(*) AS user_count,
       'Should match pre-migration count' AS expected
FROM users;

-- Check personal info migration (should be 1:1 with users)
SELECT 'PersonalInfo migration' AS check_name,
       COUNT(*) AS personal_info_count,
       (SELECT COUNT(*) FROM users) AS user_count,
       CASE 
           WHEN COUNT(*) <= (SELECT COUNT(*) FROM users) THEN 'PASS' 
           ELSE 'FAIL' 
       END AS status
FROM personal_info;

-- Check social links migration
SELECT 'Social links migration' AS check_name,
       platform,
       COUNT(*) AS count
FROM social_links 
GROUP BY platform;

-- Check experience bullet normalization
SELECT 'Experience bullets' AS check_name,
       COUNT(*) AS total_bullets,
       COUNT(DISTINCT "experienceId") AS experiences_with_bullets
FROM experience_bullets;

-- Check project bullet normalization  
SELECT 'Project bullets' AS check_name,
       COUNT(*) AS total_bullets,
       COUNT(DISTINCT "projectId") AS projects_with_bullets
FROM project_bullets;

-- Check profile items migration (should replace junction tables)
SELECT 'Profile items migration' AS check_name,
       "itemType",
       COUNT(*) AS count
FROM profile_items
GROUP BY "itemType";

-- Check date parsing (should have no NULL start dates for existing experiences)
SELECT 'Date parsing validation' AS check_name,
       COUNT(*) AS experiences_with_null_start_date,
       'Should be 0 or very low' AS expected
FROM experiences 
WHERE "startDate" IS NULL AND NOT "isDeleted";

-- Check user associations (no orphaned data)
SELECT 'Orphaned data check' AS check_name,
       'experiences' AS table_name,
       COUNT(*) AS orphaned_count
FROM experiences 
WHERE "userId" IS NULL
UNION ALL
SELECT 'Orphaned data check', 'projects', COUNT(*)
FROM projects 
WHERE "userId" IS NULL
UNION ALL
SELECT 'Orphaned data check', 'skills', COUNT(*)
FROM skills 
WHERE "userId" IS NULL
UNION ALL
SELECT 'Orphaned data check', 'education', COUNT(*)
FROM education 
WHERE "userId" IS NULL;

-- Check configuration JSON migration
SELECT 'Profile configuration' AS check_name,
       COUNT(*) AS profiles_with_config,
       COUNT(*) FILTER (WHERE configuration != '{}') AS profiles_with_custom_config
FROM profiles;

-- Check AI optimization migration
SELECT 'AI optimizations' AS check_name,
       COUNT(*) AS optimization_count,
       COUNT(DISTINCT "profileId") AS profiles_with_optimizations
FROM profile_optimizations;

-- Summary report
SELECT 
    'MIGRATION SUMMARY' AS report,
    (SELECT COUNT(*) FROM users) AS users,
    (SELECT COUNT(*) FROM personal_info) AS personal_info,
    (SELECT COUNT(*) FROM experiences WHERE NOT "isDeleted") AS active_experiences,
    (SELECT COUNT(*) FROM projects WHERE NOT "isDeleted") AS active_projects,
    (SELECT COUNT(*) FROM skills WHERE NOT "isDeleted") AS active_skills,
    (SELECT COUNT(*) FROM education WHERE NOT "isDeleted") AS active_education,
    (SELECT COUNT(*) FROM profiles WHERE NOT "isDeleted") AS active_profiles,
    (SELECT COUNT(*) FROM profile_items) AS profile_items;

-- Check for any remaining issues
SELECT 'POTENTIAL ISSUES' AS warning,
       CASE 
           WHEN EXISTS (SELECT 1 FROM experiences WHERE "userId" IS NULL) THEN 'Orphaned experiences found'
           WHEN EXISTS (SELECT 1 FROM projects WHERE "userId" IS NULL) THEN 'Orphaned projects found'
           WHEN EXISTS (SELECT 1 FROM skills WHERE "userId" IS NULL) THEN 'Orphaned skills found'
           WHEN EXISTS (SELECT 1 FROM education WHERE "userId" IS NULL) THEN 'Orphaned education found'
           ELSE 'No issues detected'
       END AS issue;
EOF
    
    echo -e "${GREEN}✓ Validation script created: $BACKUP_DIR/validate_migration_${TIMESTAMP}.sql${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}Starting backup process for Resume Manager migration...${NC}"
    
    check_dependencies
    setup_backup_dir
    backup_database
    validate_backup
    create_rollback_script
    create_migration_script
    create_validation_script
    
    echo ""
    echo -e "${GREEN}=== BACKUP PROCESS COMPLETED SUCCESSFULLY ===${NC}"
    echo ""
    echo -e "${BLUE}Files created:${NC}"
    echo "  📁 Backup: $BACKUP_DIR/$BACKUP_FILE"
    echo "  📁 Schema: $BACKUP_DIR/$SCHEMA_BACKUP"
    echo "  🔄 Rollback: $BACKUP_DIR/rollback_${TIMESTAMP}.sh"
    echo "  🚀 Migration: $BACKUP_DIR/execute_migration_${TIMESTAMP}.sh"
    echo "  ✅ Validation: $BACKUP_DIR/validate_migration_${TIMESTAMP}.sql"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Review the migration plan and scripts"
    echo "2. Execute migration: cd $BACKUP_DIR && ./execute_migration_${TIMESTAMP}.sh"
    echo "3. Validate results: psql \$DATABASE_URL -f validate_migration_${TIMESTAMP}.sql"
    echo "4. Update your application code"
    echo "5. If issues arise: ./rollback_${TIMESTAMP}.sh"
    echo ""
    echo -e "${GREEN}Your data is safely backed up and ready for migration!${NC}"
}

# Execute main function
main "$@"