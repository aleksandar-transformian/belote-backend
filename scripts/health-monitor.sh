#!/bin/bash

# Health Monitoring Script for Belote Backend
# This script checks the health endpoint and can restart services if needed
# Add to crontab: */5 * * * * /path/to/scripts/health-monitor.sh

set -e

# Configuration
HEALTH_URL="http://localhost:3000/health"
COMPOSE_FILE="/home/user/belote-backend/docker-compose.prod.yml"
LOG_FILE="/home/user/belote-backend/logs/health-monitor.log"
ALERT_EMAIL="your-email@example.com"  # Update this
MAX_FAILURES=3
FAILURE_COUNT_FILE="/tmp/health_failures"

# Create logs directory if it doesn't exist
mkdir -p "$(dirname "$LOG_FILE")"

# Initialize failure count
if [ ! -f "$FAILURE_COUNT_FILE" ]; then
    echo "0" > "$FAILURE_COUNT_FILE"
fi

# Function to log messages
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Function to send alert (requires mail command)
send_alert() {
    local message="$1"
    log_message "ALERT: $message"

    # Uncomment if you have mail configured
    # echo "$message" | mail -s "Belote API Health Alert" "$ALERT_EMAIL"
}

# Perform health check
log_message "Performing health check..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$HEALTH_URL" 2>&1)

if [ "$response" = "200" ]; then
    log_message "Health check passed (HTTP $response)"
    # Reset failure count on success
    echo "0" > "$FAILURE_COUNT_FILE"
else
    # Increment failure count
    current_failures=$(cat "$FAILURE_COUNT_FILE")
    new_failures=$((current_failures + 1))
    echo "$new_failures" > "$FAILURE_COUNT_FILE"

    log_message "Health check failed! Status: $response (Failure $new_failures/$MAX_FAILURES)"

    # Take action if max failures reached
    if [ "$new_failures" -ge "$MAX_FAILURES" ]; then
        send_alert "Health check failed $MAX_FAILURES times. Attempting to restart service..."

        # Check container logs
        log_message "Checking container logs..."
        docker-compose -f "$COMPOSE_FILE" logs --tail=50 app >> "$LOG_FILE" 2>&1

        # Restart service
        log_message "Restarting application container..."
        if docker-compose -f "$COMPOSE_FILE" restart app; then
            log_message "Container restarted successfully"
            send_alert "Service restarted successfully"
            # Reset failure count after restart
            echo "0" > "$FAILURE_COUNT_FILE"
        else
            log_message "ERROR: Failed to restart container"
            send_alert "CRITICAL: Failed to restart service after health check failures"
        fi
    fi
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    log_message "WARNING: Disk usage is at ${DISK_USAGE}%"
    send_alert "Disk usage is at ${DISK_USAGE}%"
fi

# Check memory usage
MEMORY_USAGE=$(free | grep Mem | awk '{print int($3/$2 * 100)}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    log_message "WARNING: Memory usage is at ${MEMORY_USAGE}%"
    send_alert "Memory usage is at ${MEMORY_USAGE}%"
fi

log_message "Health monitoring completed"
