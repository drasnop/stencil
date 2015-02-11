var mapping = [
	{
		"selector":".addTask-input",
		"options":["shortcut_add_new_task"]
	},
	{
		"selector":	".taskItem-star .icon.task-starred, "+
					".taskItem-star .wundercon.starred, "+
					".detail-star .icon.detail-starred, "+
					".detail-star .wundercon.starred",
		"options":["behavior_star_tasks_to_top","shortcut_mark_task_starred"]
	},
	{
		"selector":	".taskItem-duedate, "+
					".detail-date .token_0",
		"options":["date_format","start_of_week"]
	},
	
	{
		"selector":	".detail-checkbox .checkBox, "+
					".taskItem-checkboxWrapper .checkBox",
		"options":["sound_checkoff_enabled","shortcut_mark_task_done"]
	},
	{
		"selector":".filters-collection .sidebarItem a[href='#/lists/inbox']",
		"options":["shortcut_goto_inbox"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='All']",
		"options":["smartlist_visibility_all","shortcut_goto_filter_all"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Assigned to me']",
		"options":["smartlist_visibility_assigned_to_me","shortcut_goto_filter_assigned"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Completed']",
		"options":["smartlist_visibility_done","shortcut_goto_filter_completed"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Starred']",
		"options":["smartlist_visibility_starred","shortcut_goto_filter_starred"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Today']",
		"options":["smartlist_visibility_today","shortcut_goto_filter_today"]
	},
	{
		"selector":".filters-collection .sidebarItem[aria-hidden=false] a[aria-label='Week']",
		"options":["smartlist_visibility_week","shortcut_goto_filter_week"]
	},
	{
		"selector":	"#main-toolbar .wundercon.bell-medium, "+
					".detail-reminder .wundercon.reminder",
		"options":["notifications_desktop_enabled","notifications_email_enabled",
					"notifications_push_enabled","sound_notification_enabled"]
	},
	{
		"selector": ".avatar",
		"options":["shortcut_sync","shortcut_goto_preferences"]
	},
	{
		"selector":"#main-toolbar .wundercon.search",
		"options":["shortcut_goto_search"]
	},
	{
		"selector":".sidebarActions-addList",
		"options":["shortcut_add_new_list"]
	},
	{
		"selector":".actionBar-bottom div.tab.more",
		"options":["print_completed_items"]
	},
	{
		"selector":".detail-trash .wundercon.trash",
		"options":["confirm_delete_entity","shortcut_delete"]
	}
];
var options=
{
	"_locale": {
		"label": "",
		"value": "en",
		"values": [
		"en"
		],
		"tab": ""
	},
	"account_locale": {
		"label": "",
		"value": "en_GB",
		"values": [
		"en_GB"
		],
		"tab": ""
	},
	"add_to_chrome": {
		"label": "",
		"value": false,
		"values": [],
		"tab": ""
	},
	"add_to_firefox": {
		"label": "",
		"value": false,
		"values": [],
		"tab": ""
	},
	"app_first_used": {
		"label": "",
		"value": 1421913600000,
		"values": [
		"1421913600000"
		],
		"tab": ""
	},
	"auto_reminder_noticeperiod": {
		"label": "",
		"value": 0,
		"values": [
		"0"
		],
		"tab": ""
	},
	"auto_reminder_timeinterval": {
		"label": "",
		"value": 540,
		"values": [
		"540"
		],
		"tab": ""
	},
	"background": {
		"label": "",
		"value": "wlbackground15",
		"values": [
		"wlbackground15"
		],
		"tab": ""
	},
	"behavior_star_tasks_to_top": {
		"label": "Star moves item to top",
		"value": true,
		"values": [],
		"tab": "General"
	},
	"chrome_app_rating_later": {
		"label": "",
		"value": "undefined",
		"values": [
		"undefined"
		],
		"tab": ""
	},
	"chrome_rating_later": {
		"label": "",
		"value": "undefined",
		"values": [
		"undefined"
		],
		"tab": ""
	},
	"confirm_delete_entity": {
		"label": "Confirm before deleting items",
		"value": true,
		"values": [],
		"tab": "General"
	},
	"date_format": {
		"label": "Date Format",
		"value": "DD.MM.YYYY",
		"values": [
		"DD.MM.YYYY"
		],
		"tab": "General"
	},
	"enable_natural_date_recognition": {
		"label": "",
		"value": true,
		"values": [],
		"tab": ""
	},
	"id": {
		"label": "",
		"value": "userSettings",
		"values": [
		"userSettings"
		],
		"tab": ""
	},
	"language": {
		"label": "Language",
		"value": "en_GB",
		"values": [
		"en_GB"
		],
		"tab": "General"
	},
	"last_open_app_date": {
		"label": "",
		"value": 0,
		"values": [
		"0"
		],
		"tab": ""
	},
	"migrated_wunderlist_one_user": {
		"label": "",
		"value": true,
		"values": [],
		"tab": ""
	},
	"new_installation": {
		"label": "",
		"value": false,
		"values": [],
		"tab": ""
	},
	"new_task_location": {
		"label": "Add Items",
		"value": "top",
		"values": [
		"top","bottom"
		],
		"tab": "General"
	},
	"newsletter_subscription_enabled": {
		"label": "",
		"value": false,
		"values": [],
		"tab": ""
	},
	"notifications_desktop_enabled": {
		"label": "Desktop Notifications",
		"value": true,
		"values": [],
		"tab": "Notifications"
	},
	"notifications_email_enabled": {
		"label": "Email Notifications",
		"value": true,
		"values": [],
		"tab": "Notifications"
	},
	"notifications_push_enabled": {
		"label": "Push Notifications",
		"value": true,
		"values": [],
		"tab": "Notifications"
	},
	"onboarding_add_todo": {
		"label": "",
		"value": true,
		"values": [],
		"tab": ""
	},
	"onboarding_click_create_list": {
		"label": "",
		"value": true,
		"values": [],
		"tab": ""
	},
	"onboarding_click_share_list": {
		"label": "",
		"value": true,
		"values": [],
		"tab": ""
	},
	"print_completed_items": {
		"label": "Print completed items",
		"value": false,
		"values": [],
		"tab": "General"
	},
	"pro_trial_limit_assigning": {
		"label": "",
		"value": 3,
		"values": [
		"3"
		],
		"tab": ""
	},
	"pro_trial_limit_comments": {
		"label": "",
		"value": 10,
		"values": [
		"10"
		],
		"tab": ""
	},
	"pro_trial_limit_files": {
		"label": "",
		"value": 3,
		"values": [
		"3"
		],
		"tab": ""
	},
	"shortcut_add_new_list": {
		"label": "Add a New List",
		"value": "CTRL + L",
		"values": [
		"CTRL + L"
		],
		"tab": "Shortcuts"
	},
	"shortcut_add_new_task": {
		"label": "Add a New Item",
		"value": "CTRL + 0",
		"values": [
		"CTRL + 0"
		],
		"tab": "Shortcuts"
	},
	"shortcut_copy_tasks": {
		"label": "",
		"value": "CTRL + C",
		"values": [
		"CTRL + C"
		],
		"tab": ""
	},
	"shortcut_cut_tasks": {
		"label": "",
		"value": "CTRL + X",
		"values": [
		"CTRL + X"
		],
		"tab": ""
	},
	"shortcut_delete": {
		"label": "Delete Selected List or Item",
		"value": "CTRL + BACKSPACE",
		"values": [
		"CTRL + BACKSPACE"
		],
		"tab": "Shortcuts"
	},
	"shortcut_goto_filter_all": {
		"label": "Open 'All' Smart List",
		"value": "CTRL + 5",
		"values": [
		"CTRL + 5"
		],
		"tab": "Shortcuts-more"
	},
	"shortcut_goto_filter_assigned": {
		"label": "Open 'Assigned to Me' Smart List",
		"value": "CTRL + 1",
		"values": [
		"CTRL + 1"
		],
		"tab": "Shortcuts-more"
	},
	"shortcut_goto_filter_completed": {
		"label": "Open 'Completed' Smart List",
		"value": "CTRL + 6",
		"values": [
		"CTRL + 6"
		],
		"tab": "Shortcuts-more"
	},
	"shortcut_goto_filter_starred": {
		"label": "Open 'Starred' Smart List",
		"value": "CTRL + 2",
		"values": [
		"CTRL + 2"
		],
		"tab": "Shortcuts-more"
	},
	"shortcut_goto_filter_today": {
		"label": "Open 'Today' Smart List",
		"value": "CTRL + 3",
		"values": [
		"CTRL + 3"
		],
		"tab": "Shortcuts-more"
	},
	"shortcut_goto_filter_week": {
		"label": "Open 'Week' Smart List",
		"value": "CTRL + 4",
		"values": [
		"CTRL + 4"
		],
		"tab": "Shortcuts-more"
	},
	"shortcut_goto_inbox": {
		"label": "Open Inbox",
		"value": "CTRL + I",
		"values": [
		"CTRL + I"
		],
		"tab": "Shortcuts-more"
	},
	"shortcut_goto_preferences": {
		"label": "Open Preferences",
		"value": "CTRL + P",
		"values": [
		"CTRL + P", "CTRL + ."
		],
		"tab": "Shortcuts-more"
	},
	"shortcut_goto_search": {
		"label": "Focus Search",
		"value": "CTRL + F",
		"values": [
		"CTRL + F"
		],
		"tab": "Shortcuts"
	},
	"shortcut_mark_task_done": {
		"label": "Mark Selected Items as 'Completed'",
		"value": "CTRL + D",
		"values": [
		"CTRL + D"
		],
		"tab": "Shortcuts"
	},
	"shortcut_mark_task_starred": {
		"label": "Mark Selected Items as 'Starred'",
		"value": "CTRL + S",
		"values": [
		"CTRL + S", "CTRL + T"
		],
		"tab": "Shortcuts"
	},
	"shortcut_paste_tasks": {
		"label": "",
		"value": "CTRL + V",
		"values": [
		"CTRL + V"
		],
		"tab": ""
	},
	"shortcut_select_all_tasks": {
		"label": "Select All Items",
		"value": "CTRL + A",
		"values": [
		"CTRL + A"
		],
		"tab": "Shortcuts"
	},
	"shortcut_send_via_email": {
		"label": "Email List",
		"value": "CTRL + E",
		"values": [
		"CTRL + E"
		],
		"tab": "Shortcuts-more"
	},
	"shortcut_show_notifications": {
		"label": "Show Activities",
		"value": "CTRL + SHIFT + A",
		"values": [
		"CTRL + SHIFT + A"
		],
		"tab": "Shortcuts-more"
	},
	"shortcut_sync": {
		"label": "Sync",
		"value": "R",
		"values": [
		"R"
		],
		"tab": "Shortcuts"
	},
	"show_completed_items": {
		"label": "",
		"value": true,
		"values": [],
		"tab": ""
	},
	"significant_event_count": {
		"label": "",
		"value": 0,
		"values": [
		"0"
		],
		"tab": ""
	},
	"smartlist_visibility_all": {
		"label": "All",
		"value": "hidden",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists"
	},
	"smartlist_visibility_assigned_to_me": {
		"label": "Assigned to me",
		"value": "visible",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists"
	},
	"smartlist_visibility_done": {
		"label": "Completed",
		"value": "visible",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists"
	},
	"smartlist_visibility_starred": {
		"label": "Starred",
		"value": "visible",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists"
	},
	"smartlist_visibility_today": {
		"label": "Today",
		"value": "visible",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists"
	},
	"smartlist_visibility_week": {
		"label": "Week",
		"value": "visible",
		"values": [
		"auto",
		"visible",
		"hidden"
		],
		"tab": "Smart Lists"
	},
	"sound_checkoff_enabled": {
		"label": "Enable sound for checking-off an item",
		"value": true,
		"values": [],
		"tab": "General"
	},
	"sound_notification_enabled": {
		"label": "Enable sound for new notifications",
		"value": true,
		"values": [],
		"tab": "General"
	},
	"start_of_week": {
		"label": "Start of the Week",
		"value": "sun",
		"values": [
		"sun"
		],
		"tab": "General"
	},
	"time_format": {
		"label": "Time Format",
		"value": "12 hour",
		"values": [
		"12 hour"
		],
		"tab": "General"
	},
	"today_smart_list_visible_tasks": {
		"label": "Week & Today Settings",
		"value": "all",
		"values": [
		"all"
		],
		"tab": "Smart Lists"
	},
	"type": {
		"label": "",
		"value": "userSettings",
		"values": [
		"userSettings"
		],
		"tab": ""
	}
};

var KEYCODE_ESC = 27;