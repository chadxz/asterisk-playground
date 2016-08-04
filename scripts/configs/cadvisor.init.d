#!/bin/sh
### BEGIN INIT INFO
# Provides:          cadvisor
# Required-Start:    $remote_fs $network $syslog
# Required-Stop:     $remote_fs $network $syslog
# Default-Start:     2 3 4 5
# Default-Stop:      0 1 6
# Short-Description: cAdvisor daemon
# Description: Start cAdvisor daemon
### END INIT INFO

NAME=cadvisor
DAEMON=/usr/bin/$NAME
LOGFILE=/var/log/$NAME.log
PIDFILE=/var/run/$NAME.pid
DAEMON_USER=root
DAEMON_ARGS=""

# Exit if executable is not installed
[ -x "$DAEMON" ] || exit 0

# Read configuration variable file if it is present
[ -r /etc/default/$NAME ] && . /etc/default/$NAME

RETRY=TERM/30/KILL/5

# Load the VERBOSE setting and other rcS variables
[ -f /etc/default/rcS ] && . /etc/default/rcS

# Define LSB log_* functions.
. /lib/lsb/init-functions

OPTS=""
[ -n "${CADVISOR_DOCKER_ENDPOINT}" ] && OPTS="$OPTS --docker=${CADVISOR_DOCKER_ENDPOINT}"
[ -n "${CADVISOR_PORT}" ] && OPTS="$OPTS --port=${CADVISOR_PORT}"
[ -n "${CADVISOR_STORAGE_DRIVER}" ] && OPTS="$OPTS --storage_driver=${CADVISOR_STORAGE_DRIVER}"
[ -n "${CADVISOR_STORAGE_DRIVER_HOST}" ] && OPTS="$OPTS --storage_driver_host=${CADVISOR_STORAGE_DRIVER_HOST}"
[ -n "${CADVISOR_STORAGE_DRIVER_PASSWORD}" ] && OPTS="$OPTS --storage_driver_password=${CADVISOR_STORAGE_DRIVER_PASSWORD}"
[ -n "${CADVISOR_STORAGE_DRIVER_SECURE}" ] && OPTS="$OPTS --storage_driver_secure=${CADVISOR_STORAGE_DRIVER_SECURE}"
[ -n "${CADVISOR_STORAGE_DRIVER_USER}" ] && OPTS="$OPTS --storage_driver_user=${CADVISOR_STORAGE_DRIVER_USER}"
[ -n "${CADVISOR_LOG_TO_STDERR}" ] && OPTS="$OPTS --logtostderr=${CADVISOR_LOG_TO_STDERR}"
DAEMON_ARGS="$OPTS $DAEMON_ARGS"

_ev_ () {
  [ "$VERBOSE" = "no" ] || eval $@
}

case "$1" in
    start)
        _ev_ log_action_begin_msg \"Starting $NAME\"
        if R=$($0 status); then
            _ev_ log_action_end_msg 0 \"$R\"
        else
            R=$(start-stop-daemon --start --exec $DAEMON --pidfile $PIDFILE --make-pidfile \
             --chuid $DAEMON_USER --background --no-close -- $DAEMON_ARGS >> $LOGFILE 2>&1)
            sleep 0.2
            $0 status >>/dev/null
            _ev_ log_action_end_msg $? \"$R\"
        fi
    ;;
    debug)
        OPTS="--logtostderr=true $OPTS"
        start-stop-daemon --start --exec $DAEMON --pidfile $PIDFILE --make-pidfile -- $DAEMON_ARGS
    ;;
    stop)
        _ev_ log_action_begin_msg \"Stopping $NAME\"
        R=$(start-stop-daemon --stop --oknodo --name $NAME --pidfile $PIDFILE --remove-pidfile --retry=$RETRY 2>&1)
        _ev_ log_action_end_msg $? \"$R\"
    ;;
    status)
        ## return status 0 if process is running.
        status_of_proc -p $PIDFILE "$DAEMON" "$NAME"
    ;;
    restart|force-reload)
        $0 stop
        $0 start
    ;;
    *)
        echo "Usage: /etc/init.d/$NAME {start|debug|stop|restart|force-reload|status}" >&2
        exit 1
    ;;
esac
