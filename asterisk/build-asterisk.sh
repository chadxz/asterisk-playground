#!/bin/bash

PROGNAME=$(basename $0)

if test -z ${ASTERISK_VERSION}; then
    echo "${PROGNAME}: ASTERISK_VERSION required" >&2
    exit 1
fi

MENUSELECT_DISABLE=(
    app_talkdetect app_adsiprog app_alarmreceiver app_voicemail
    app_amd app_chanisavail app_dictate app_externalivr app_festival
    app_getcpeid app_ices app_image app_minivm app_morsecode app_mp3
    app_nbscat app_sms app_test app_url app_waitforring app_waitforsilence
    app_zapateller cdr_custom cdr_manager cdr_syslog cdr_sqlite3_custom
    cel_custom cel_manager cel_sqlite3_custom chan_iax2 chan_alsa
    chan_console chan_mgcp chan_oss chan_phone chan_sip chan_skinny
    chan_unistim func_audiohookinherit pbx_ael pbx_dundi pbx_realtime
    res_fax res_ael_share res_fax_spandsp res_phoneprov
    res_pjsip_phoneprov_provider BUILD_NATIVE CORE-SOUNDS-EN-GSM
)

MENUSELECT_ENABLE=(
    BETTER_BACKTRACES res_endpoint_stats res_mwi_external res_stasis_mailbox
    codec_opus res_ari_mailboxes CORE-SOUNDS-EN-WAV CORE-SOUNDS-EN-ULAW
    CORE-SOUNDS-EN-SLN16 MOH-OPSOUND-SLN16 MOH-OPSOUND-WAV MOH-OPSOUND-ULAW
    EXTRA-SOUNDS-EN-WAV EXTRA-SOUNDS-EN-ULAW EXTRA-SOUNDS-EN-SLN16
)

set -ex

mkdir -p /usr/src/asterisk
cd /usr/src/asterisk

curl -vsL https://github.com/asterisk/asterisk/archive/${ASTERISK_VERSION}.tar.gz |
    tar --strip-components 1 -xz

# 1.5 jobs per core works out okay
: ${JOBS:=$(( $(nproc) + $(nproc) / 2 ))}

./configure --with-resample
make menuselect/menuselect menuselect-tree menuselect.makeopts

for i in "${MENUSELECT_DISABLE[@]}"; do
    menuselect/menuselect --disable $i menuselect.makeopts
done

for i in "${MENUSELECT_ENABLE[@]}"; do
    menuselect/menuselect --enable $i menuselect.makeopts
done

make -j ${JOBS} all
make install

chown -R asterisk:asterisk /var/*/asterisk
chmod -R 750 /var/spool/asterisk
mkdir -p /etc/asterisk/

cd /
exec rm -rf /usr/src/asterisk
