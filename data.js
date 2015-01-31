var mapping = [
	{
		"selector":".addTask",
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
var options={
	"_locale": {
		"label": "",
		"value": "en",
		"values": ["en"]
	},
	"account_locale": {
		"label": "",
		"value": "en_GB",
		"values": ["en_GB"]
	},
	"add_to_chrome": {
		"label": "",
		"value": false,
		"values": []
	},
	"add_to_firefox": {
		"label": "",
		"value": false,
		"values": []
	},
	"app_first_used": {
		"label": "",
		"value": 1421913600000,
		"values": ["1421913600000"]
	},
	"auto_reminder_noticeperiod": {
		"label": "",
		"value": 0,
		"values": ["0"]
	},
	"auto_reminder_timeinterval": {
		"label": "",
		"value": 540,
		"values": ["540"]
	},
	"background": {
		"label": "",
		"value": "wlbackground15",
		"values": ["wlbackground15"]
	},
	"behavior_star_tasks_to_top": {
		"label": "",
		"value": true,
		"values": []
	},
	"chrome_app_rating_later": {
		"label": "",
		"value": "undefined",
		"values": ["undefined"]
	},
	"chrome_rating_later": {
		"label": "",
		"value": "undefined",
		"values": ["undefined"]
	},
	"confirm_delete_entity": {
		"label": "",
		"value": true,
		"values": []
	},
	"date_format": {
		"label": "",
		"value": "DD.MM.YYYY",
		"values": ["DD.MM.YYYY"]
	},
	"enable_natural_date_recognition": {
		"label": "",
		"value": true,
		"values": []
	},
	"id": {
		"label": "",
		"value": "userSettings",
		"values": ["userSettings"]
	},
	"language": {
		"label": "",
		"value": "en_GB",
		"values": ["en_GB"]
	},
	"last_open_app_date": {
		"label": "",
		"value": 0,
		"values": ["0"]
	},
	"migrated_wunderlist_one_user": {
		"label": "",
		"value": true,
		"values": []
	},
	"new_installation": {
		"label": "",
		"value": false,
		"values": []
	},
	"new_task_location": {
		"label": "",
		"value": "top",
		"values": ["top"]
	},
	"newsletter_subscription_enabled": {
		"label": "",
		"value": false,
		"values": []
	},
	"notifications_desktop_enabled": {
		"label": "",
		"value": true,
		"values": []
	},
	"notifications_email_enabled": {
		"label": "",
		"value": true,
		"values": []
	},
	"notifications_push_enabled": {
		"label": "",
		"value": true,
		"values": []
	},
	"onboarding_add_todo": {
		"label": "",
		"value": true,
		"values": []
	},
	"onboarding_click_create_list": {
		"label": "",
		"value": true,
		"values": []
	},
	"onboarding_click_share_list": {
		"label": "",
		"value": true,
		"values": []
	},
	"print_completed_items": {
		"label": "",
		"value": false,
		"values": []
	},
	"pro_trial_limit_assigning": {
		"label": "",
		"value": 3,
		"values": ["3"]
	},
	"pro_trial_limit_comments": {
		"label": "",
		"value": 10,
		"values": ["10"]
	},
	"pro_trial_limit_files": {
		"label": "",
		"value": 3,
		"values": ["3"]
	},
	"shortcut_add_new_list": {
		"label": "",
		"value": "CTRL + L",
		"values": ["CTRL + L"]
	},
	"shortcut_add_new_task": {
		"label": "",
		"value": "CTRL + 0",
		"values": ["CTRL + 0"]
	},
	"shortcut_copy_tasks": {
		"label": "",
		"value": "CTRL + C",
		"values": ["CTRL + C"]
	},
	"shortcut_cut_tasks": {
		"label": "",
		"value": "CTRL + X",
		"values": ["CTRL + X"]
	},
	"shortcut_delete": {
		"label": "",
		"value": "CTRL + BACKSPACE",
		"values": ["CTRL + BACKSPACE"]
	},
	"shortcut_goto_filter_all": {
		"label": "",
		"value": "CTRL + 5",
		"values": ["CTRL + 5"]
	},
	"shortcut_goto_filter_assigned": {
		"label": "",
		"value": "CTRL + 1",
		"values": ["CTRL + 1"]
	},
	"shortcut_goto_filter_completed": {
		"label": "",
		"value": "CTRL + 6",
		"values": ["CTRL + 6"]
	},
	"shortcut_goto_filter_starred": {
		"label": "",
		"value": "CTRL + 2",
		"values": ["CTRL + 2"]
	},
	"shortcut_goto_filter_today": {
		"label": "",
		"value": "CTRL + 3",
		"values": ["CTRL + 3"]
	},
	"shortcut_goto_filter_week": {
		"label": "",
		"value": "CTRL + 4",
		"values": ["CTRL + 4"]
	},
	"shortcut_goto_inbox": {
		"label": "",
		"value": "CTRL + I",
		"values": ["CTRL + I"]
	},
	"shortcut_goto_preferences": {
		"label": "",
		"value": "CTRL + P",
		"values": ["CTRL + P"]
	},
	"shortcut_goto_search": {
		"label": "",
		"value": "CTRL + F",
		"values": ["CTRL + F"]
	},
	"shortcut_mark_task_done": {
		"label": "",
		"value": "CTRL + D",
		"values": ["CTRL + D"]
	},
	"shortcut_mark_task_starred": {
		"label": "",
		"value": "CTRL + S",
		"values": ["CTRL + S"]
	},
	"shortcut_paste_tasks": {
		"label": "",
		"value": "CTRL + V",
		"values": ["CTRL + V"]
	},
	"shortcut_select_all_tasks": {
		"label": "",
		"value": "CTRL + A",
		"values": ["CTRL + A"]
	},
	"shortcut_send_via_email": {
		"label": "",
		"value": "CTRL + E",
		"values": ["CTRL + E"]
	},
	"shortcut_show_notifications": {
		"label": "",
		"value": "CTRL + SHIFT + A",
		"values": ["CTRL + SHIFT + A"]
	},
	"shortcut_sync": {
		"label": "",
		"value": "R",
		"values": ["R"]
	},
	"show_completed_items": {
		"label": "",
		"value": true,
		"values": []
	},
	"significant_event_count": {
		"label": "",
		"value": 0,
		"values": ["0"]
	},
	"smartlist_visibility_all": {
		"label": "",
		"value": "hidden",
		"values": ["auto","visible","hidden"]
	},
	"smartlist_visibility_assigned_to_me": {
		"label": "",
		"value": "visible",
		"values": ["auto","visible","hidden"]
	},
	"smartlist_visibility_done": {
		"label": "",
		"value": "visible",
		"values": ["auto","visible","hidden"]
	},
	"smartlist_visibility_starred": {
		"label": "",
		"value": "visible",
		"values": ["auto","visible","hidden"]
	},
	"smartlist_visibility_today": {
		"label": "",
		"value": "visible",
		"values": ["auto","visible","hidden"]
	},
	"smartlist_visibility_week": {
		"label": "",
		"value": "visible",
		"values": ["auto","visible","hidden"]
	},
	"sound_checkoff_enabled": {
		"label": "",
		"value": true,
		"values": []
	},
	"sound_notification_enabled": {
		"label": "",
		"value": true,
		"values": []
	},
	"start_of_week": {
		"label": "",
		"value": "sun",
		"values": ["sun"]
	},
	"time_format": {
		"label": "",
		"value": "12 hour",
		"values": ["12 hour"]
	},
	"today_smart_list_visible_tasks": {
		"label": "",
		"value": "all",
		"values": ["all"]
	},
	"type": {
		"label": "",
		"value": "userSettings",
		"values": ["userSettings"]
	}
};
var KEYCODE_ESC = 27;