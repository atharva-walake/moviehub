const SHIFT_CONF_URL = "/v3/configurations/shifts_conf";
class ShiftEditor extends React.Component {
  constructor(props) {
    super(props);
    let shiftKey = props.match.params.shift_key;
    if (shiftKey == "new") {
      shiftKey = undefined;
    }
    this.state = {
      name: "",
      code: "",
      startTime: moment(),
      endTime: moment(),
      workingDayStr: moment().format("YYYY/MM/DD"),
      shiftKey: shiftKey,
      defaultShift: "",
      previousDay: "",
      nextDay: "",
      description: "",
      shiftDownTime: []
    };
    this.getFieldValue = this.getFieldValue.bind(this);
    this.setFieldValue = this.setFieldValue.bind(this);
    this.onClick = this.onClick.bind(this);

    this.create_permission = this.props.Permissions.canAccessResource(
      "general",
      "shift",
      "CREATE"
    );
    this.update_permission = this.props.Permissions.canAccessResource(
      "general",
      "shift",
      "UPDATE"
    );
    this.delete_permission = this.props.Permissions.canAccessResource(
      "general",
      "shift",
      "DELETE"
    );
  }

  componentDidMount() {
    if (this.state.shiftKey != undefined) {
      let url = `${Urls.SHIFT_URL}/${this.state.shiftKey}`;
      Mint.get(url, {}, (code, result) => {
        let { from, to } = ShiftUtils.getShiftTime(
          result.generic_object,
          this.state.workingDayStr,
          ACCOUNT_TIMEZONE
        );
        this.setState({
          name: result.generic_object.name,
          code: result.generic_object.code,
          description: result.generic_object.description,
          startTime: moment(
            from.format(`${DATE_FORMAT} HH:mm`),
            `${DATE_FORMAT} HH:mm`
          ),
          endTime: moment(
            to.format(`${DATE_FORMAT} HH:mm`),
            `${DATE_FORMAT} HH:mm`
          ),
          defaultShift: result.generic_object.properties.defaultShift,
          previousDay: result.generic_object.properties.previousDay,
          nextDay: result.generic_object.properties.nextDay
        });
      });
    }
  }

  getFieldValue(field) {
    return this.state[field];
  }

  setFieldValue(field, event) {
    map = {};
    map[field] = event.target != null ? event.target.value : event;
    this.setState(map);
  }

  validateShiftForm() {
    const { t } = this.props;
    const { name, code, startTime, endTime } = this.state;
    let retval =
      ValidationUtils.validatePresence(name, t("_name_")) &&
      ValidationUtils.validatePresence(code, t("code")) &&
      ValidationUtils.validatePresence(startTime, t("_start_time_")) &&
      ValidationUtils.validatePresence(endTime, t("_end_time_")) &&
      ValidationUtils.validateSecurity(name, t("_name_"));

    return retval;
  }

  getShiftDowntime() {
    let dayOffset = 86400;
    let shiftDownTime = [];
    if (this.state.shiftDownTime != "") {
      let previousDay = this.state.previousDay;
      let nextDay = this.state.nextDay;
      this.state.shiftDownTime.forEach(function(item, index) {
        let map = {
          name: item.name == null ? item.properties.reasonName : item.name,
          code: item.properties.reasonCode + moment().valueOf() + index,
          properties: {
            from_hour: item.properties.from_hour,
            from_minute: item.properties.from_minute,
            to_hour: item.properties.to_hour,
            to_minute: item.properties.to_minute,
            previousDay: previousDay,
            nextDay: nextDay,
            reasonName: item.properties.reasonName,
            reasonCode: item.properties.reasonCode,
            reasonKey: item.properties.reasonKey
          }
        };
        shiftDownTime.push(map);
      });
    }

    return shiftDownTime;
  }

  getShiftParams() {
    let utcOffset = moment().utcOffset() * 60;
    return {
      type: "Shift",
      name: this.state.name,
      code: this.state.code || this.state.name,
      description: this.state.description,
      properties: {
        dayOffset: 86400,
        from_hour: Number(this.state.startTime.format("HH")),
        from_minute: Number(this.state.startTime.format("mm")),
        to_hour: Number(this.state.endTime.format("HH")),
        to_minute: Number(this.state.endTime.format("mm")),
        previousDay: this.state.previousDay,
        nextDay: this.state.nextDay,
        softDeleted: false,
        defaultShift: this.state.defaultShift
      }
    };
  }

  onClick() {
    const { t } = this.props;
    if (this.validateShiftForm()) {
      let shiftDownTime = this.getShiftDowntime();
      let shift = this.getShiftParams();

      let params = {
        shiftDownTime: shiftDownTime,
        shift: shift
      };
      if (this.state.shiftKey == null) {
        Mint.post(
          `${Urls.SHIFT_URL}/`,
          params,
          (code, result) => {
            this.setState({
              shiftKey: result.generic_object_key
            });
            toast.success(
              t("_generic_messages_._created_successfully_", {
                name: result.name,
                object: t("_shift_")
              })
            );
            const editURL = this.props.history.location.pathname.replace(
              "new",
              `${result.generic_object_key}`
            );
            window.location = SHIFT_CONF_URL;
          },
          (code, result) => {
            toast.error(
              t("_generic_messages_._created_error_", {
                name: params.shift.name,
                object: t("_shift_"),
                error: result.responseJSON.errors[0]
              })
            );
          },
          null
        );
      } else {
        url = `${Urls.SHIFT_URL}/` + this.state.shiftKey;
        Mint.put(
          url,
          params,
          (code, result) => {
            toast.success(
              t("_generic_messages_._updated_successfully_", {
                name: result.name
              })
            );
            window.location = SHIFT_CONF_URL;
          },
          (code, result) => {
            toast.error(
              t("_generic_messages_._update_error_", {
                name: params.shift.name,
                error: result.responseJSON.errors[0]["message"]
              })
            );
          }
        );
      }
    }
  }

  render() {
    const { t } = this.props;
    const {
      Button,
      Grid,
      Card,
      CardContent,
      Typography,
      Box,
      Breadcrumbs,
      Paper,
      Link
    } = Materio;
    let primaryBtnLabel = t("_save_");
    let breadcumbTitle = t("_new_");
    if (this.state.shiftKey != null) {
      title = t("_edit_shift_");
      primaryBtnLabel = t("_update_");
      breadcumbTitle = this.state.name;
    }

    return (
      <div>
        <ActionBar>
          <Paper
            sx={{ padding: "10px 20px", marginBottom: "20px" }}
            variant="outlined"
          >
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={4}>
                <Breadcrumbs separator="›">
                  <Link color="inherit" to="/">
                    {t("_home_")}
                  </Link>
                  <Link color="inherit" to={SHIFT_CONF_URL}>
                    {t("_shifts_")}
                  </Link>
                  <Typography color="textPrimary">{breadcumbTitle} </Typography>
                </Breadcrumbs>
              </Grid>
            </Grid>
          </Paper>
        </ActionBar>
        <Card headerBorder footerBorder>
          <CardContent>
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <ShiftForm
                  getFieldValue={this.getFieldValue}
                  setFieldValue={this.setFieldValue}
                  setDefaultShift={v =>
                    this.setFieldValue("defaultShift", v.target.checked)
                  }
                  setStartTime={v => this.setFieldValue("startTime", v)}
                  setEndTime={v => this.setFieldValue("endTime", v)}
                  setPreviousDay={v => {
                    this.setFieldValue("previousDay", v.target.checked);
                    this.setFieldValue("nextDay", false); // when one switch is selected other should get deselected
                  }}
                  setNextDay={v => {
                    this.setFieldValue("nextDay", v.target.checked);
                    this.setFieldValue("previousDay", false);
                  }}
                  t={this.props.t}
                />
              </Grid>
              <Grid item xs={12}>
                <DowntimeTable
                  shiftKey={this.state.shiftKey}
                  t={this.props.t}
                  setShiftDownTime={v => this.setFieldValue("shiftDownTime", v)}
                  createPermission={this.create_permission}
                  updatePermission={this.update_permission}
                  deletePermission={this.delete_permission}
                  shiftStartTime={this.getFieldValue("startTime")}
                  shiftEndTime={this.getFieldValue("endTime")}
                  workingDayStr={this.getFieldValue("workingDayStr")}
                />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: "flex", justifyContent: "flex-end" }}
              >
                <Button
                  color="primary"
                  aria-label="Save"
                  variant="contained"
                  onClick={() => this.onClick()}
                  disabled={!this.update_permission}
                >
                  {primaryBtnLabel}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </div>
    );
  }
}

class DowntimeTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reasons: []
    };

    this.setReasons = this.setReasons.bind(this);
    this.onDelete = this.onDelete.bind(this);
  }

  componentDidMount() {
    if (this.props.shiftKey != null) {
      Mint.get(
        "/api/v1/generic_objects",
        {
          per: 1000,
          page: 1,
          type: "ShiftDowntime",
          parent_key: this.props.shiftKey,
          order_by: "properties.from_hour",
          order: "asc"
        },
        (code, result) => {
          let resData = result.generic_objects;
          resData = resData.map((data, index) => {
            return {
              ...data,
              id: index
            };
          });
          this.setState({ reasons: resData }, () => {
            this.props.setShiftDownTime(resData);
          });
        }
      );
    }
  }

  setReasons(index, map) {
    if (index == undefined) {
      this.state.reasons.push(map);
    } else {
      this.state.reasons[index] = map;
    }
    this.props.setShiftDownTime(this.state.reasons);
  }

  onDelete(index) {
    this.state.reasons.splice(index, 1);
    this.setState({});
  }

  getPageColumns() {
    const { t } = this.props;
    const { Tooltip, IconButton } = Materio;
    let columns = [
      {
        headerName: t("_reason_"),
        field: "reason",
        minWidth: 150,
        renderCell: row => row.value
      },
      {
        headerName: `${t("_start_time_")} (${ACCOUNT_TIMEZONE})`,
        field: "start_time",
        minWidth: 250,
        type: "number",
        sortable: false,
        filterable: false,
        renderCell: row => {
          let from = ShiftUtils.getShiftTime(
            row.row.object,
            moment().format("YYYY/MM/DD"),
            ACCOUNT_TIMEZONE
          ).from;
          return <div>{from.format("HH:mm")}</div>;
        }
      }
    ];
    if (ACCOUNT_TIMEZONE != current_user_timezone) {
      columns.push({
        headerName: `${t("_start_time_")} (${current_user_timezone})`,
        field: "cur_start_time",
        minWidth: 250,
        type: "number",
        sortable: false,
        filterable: false,
        renderCell: row => {
          let from = ShiftUtils.getShiftTime(
            row.row.object,
            moment().format("YYYY/MM/DD"),
            ACCOUNT_TIMEZONE
          ).from;
          return <div>{from.tz(current_user_timezone).format("HH:mm")}</div>;
        }
      });
    }
    columns.push({
      headerName: `${t("_end_time_")} (${ACCOUNT_TIMEZONE})`,
      field: "end_time",
      minWidth: 250,
      type: "number",
      sortable: false,
      filterable: false,
      renderCell: row => {
        let to = ShiftUtils.getShiftTime(
          row.row.object,
          moment().format("YYYY/MM/DD"),
          ACCOUNT_TIMEZONE
        ).to;
        return <div>{to.format("HH:mm")}</div>;
      }
    });
    if (current_user_timezone != ACCOUNT_TIMEZONE) {
      columns.push({
        headerName: `${t("_end_time_")} (${current_user_timezone})`,
        field: "cur_end_time",
        minWidth: 250,
        type: "number",
        sortable: false,
        filterable: false,

        renderCell: row => {
          let to = ShiftUtils.getShiftTime(
            row.row.object,
            moment().format("YYYY/MM/DD"),
            ACCOUNT_TIMEZONE
          ).to;
          return <div>{to.tz(current_user_timezone).format("HH:mm")}</div>;
        }
      });
    }
    columns.push({
      headerName: t("_actions_"),
      field: "actions",
      sortable: false,
      filterable: false,
      minWidth: 150,
      renderCell: row => (
        <>
          <div style={{ display: "inline-flex", paddingLeft: "6px" }}>
            <ShiftDownTimeModal
              t={this.props.t}
              shiftKey={this.props.shiftKey}
              shiftDownTimeKey={row.row.generic_object_key}
              data={this.state.reasons}
              setReasons={this.setReasons.bind(this, row.row.index)}
              shiftStartTime={this.props.shiftStartTime}
              shiftEndTime={this.props.shiftEndTime}
              index={row.row.index}
              createPermission={this.props.createPermission}
              updatePermission={this.props.updatePermission}
              deletePermission={this.props.deletePermission}
            />
          </div>
          <DeleteShiftDowntime
            onDelete={this.onDelete.bind(this, row.row.index)}
            key={row.row.generic_object_key}
            name={row.row.name}
            t={t}
          />
        </>
      )
    });
    return columns;
  }

  render() {
    const { t } = this.props;
    const { Box, Button, Grid, Typography } = Materio;
    return (
      <Box>
        <Grid container spacing={6}>
          <Grid
            item
            xs={12}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Typography variant="h5" sx={{ fontSize: "1.25rem !important" }}>
              {t("_planned_downtime_")}
            </Typography>
            <ShiftDownTimeModal
              t={this.props.t}
              data={this.state.reasons}
              setReasons={this.setReasons.bind(this, undefined)}
              shiftStartTime={this.props.shiftStartTime}
              shiftEndTime={this.props.shiftEndTime}
              createPermission={this.props.createPermission}
              updatePermission={this.props.updatePermission}
              deletePermission={this.props.deletePermission}
            />
          </Grid>
          <Grid item xs={12}>
            <Materio.DataGrid
              columns={this.getPageColumns()}
              data={this.state.reasons.map((row, index) => ({
                reason: row.properties.reasonName,
                object: row,
                desc: row.description || "",
                code: row.code,
                name: row.name,
                id: row.properties.reasonKey,
                index: index
              }))}
              useCard={false}
              showExtras={false}
              hideFooterPagination={true}
              action={<div />}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }
}

class ShiftDownTimeModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
    this.onSave = this.onSave.bind(this);
    this.getFieldValue = this.getFieldValue.bind(this);
    this.setFieldValue = this.setFieldValue.bind(this);
    this.loadShiftDownTime = this.loadShiftDownTime.bind(this);
    this.validate = this.validate.bind(this);
    this.handleReasonChange = this.handleReasonChange.bind(this);
  }

  loadShiftDownTime(props) {
    const { shiftKey, shiftDownTimeKey, data, index } = this.props;
    if (index != null) {
      let { from, to } = ShiftUtils.getShiftTime(
        data[index],
        moment().format("YYYY/MM/DD"),
        null
      );
      this.setState({
        generic_object_key: data[index].generic_object_key,
        reason: data[index].properties.reasonName,
        reasonKey: data[index].properties.reasonKey,
        startTime: moment(
          from.format(`${DATE_FORMAT} HH:mm`),
          `${DATE_FORMAT} HH:mm`
        ),
        endTime: moment(
          to.format(`${DATE_FORMAT} HH:mm`),
          `${DATE_FORMAT} HH:mm`
        ),
        reasonCategoryKey: data[index].properties.reasonCategoryKey
      });
    } else {
      this.setState(this.getDefaultState());
    }
    this.setState({ show: true });
  }

  validate() {
    const { t } = this.props;
    const { reason, startTime, endTime, reasonCode } = this.state;
    return (
      ValidationUtils.validatePresence(startTime, t("_start_time_")) &&
      ValidationUtils.validatePresence(endTime, t("_end_time_")) &&
      ValidationUtils.validatePresence(reason, t("_reason_")) &&
      ValidationUtils.validateSecurity(reasonCode, t("_reason_code_")) &&
      ValidationUtils.validateSecurity(reason, t("_reason_"))
    );
  }

  getDefaultState() {
    return {
      reason: "",
      startTime: moment(),
      endTime: moment(),
      reasonCode: "",
      reasonCategoryKey: "ALL",
      reasonKey: "",
      generic_object_key: undefined
    };
  }

  onSave() {
    if (this.validate()) {
      let map = {
        name: this.state.reason,
        generic_object_key: this.state.generic_object_key,
        properties: {
          from_hour: Number(this.state.startTime.format("HH")),
          from_minute: Number(this.state.startTime.format("mm")),
          to_hour: Number(this.state.endTime.format("HH")),
          to_minute: Number(this.state.endTime.format("mm")),
          reasonName: this.state.reason,
          reasonCode: this.state.reasonCode,
          reasonKey: this.state.reasonKey,
          reasonCategoryKey: this.state.reasonCategoryKey
        }
      };
      this.props.setReasons(map);
      this.setState({ show: false });
    }
  }

  getFieldValue(field) {
    return this.state[field];
  }

  setFieldValue(field, event) {
    map = {};
    map[field] = event.target != null ? event.target.value : event;
    this.setState(map);
  }

  handleReasonChange(event, object) {
    this.setState({
      reasonKey: event.target.value,
      reason: object.name,
      reasonCode: object.code
    });
  }

  handleReasonCategoryChange(key, title) {
    this.setState({ reasonCategoryKey: key });
  }

  render() {
    const { t, index, createPermission } = this.props;
    const {
      Dialog,
      DialogContent,
      DialogTitle,
      Button,
      DialogActions,
      IconifyIcon,
      Divider,
      Grid,
      Box,
      Typography,
      Tooltip,
      IconButton,
      FormHelperText
    } = Materio;

    let title = t("_create_shift_downtime_");
    let startTime = this.state.startTime;
    let endTime = this.state.endTime;
    let startTimeStr =
      moment.isMoment(startTime) &&
      moment
        .tz(
          startTime.format(`${DATE_FORMAT} HH:mm`),
          `${DATE_FORMAT} HH:mm`,
          ACCOUNT_TIMEZONE
        )
        .tz(current_user_timezone)
        .format("HH:mm");
    let endTimeStr =
      moment.isMoment(endTime) &&
      moment
        .tz(
          endTime.format(`${DATE_FORMAT} HH:mm`),
          `${DATE_FORMAT} HH:mm`,
          ACCOUNT_TIMEZONE
        )
        .tz(current_user_timezone)
        .format("HH:mm");
    return (
      <div>
        {index != undefined ? (
          <Tooltip title={t("_edit_")}>
            <IconButton
              aria-label="Edit"
              onClick={e => this.loadShiftDownTime()}
              color="primary"
            >
              <Materio.IconifyIcon icon="material-symbols:edit" />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={e => this.loadShiftDownTime()}
          >
            {t("_create_")}
          </Button>
        )}

        <Dialog fullWidth open={this.state.show} maxWidth="md" scroll="body">
          <DialogTitle>{title}</DialogTitle>
          <Box></Box>
          <DialogContent>
            <Grid container spacing={6}>
              <Grid item xs={12} sm={6} md={6}>
                <ReasonCategorySelect
                  label={`${t("_category_")}*`}
                  selectedKey={this.state.reasonCategoryKey}
                  onChange={(key, title) => {
                    this.handleReasonCategoryChange(key, title);
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <ReasonSelect
                  searchable
                  label={`${t("_reason_")}*`}
                  value={this.state.reasonKey}
                  categoryKey={
                    this.state.reasonCategoryKey == "ALL"
                      ? "/.*/"
                      : this.state.reasonCategoryKey
                  }
                  onChange={this.handleReasonChange}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <DateSelect
                  date={this.state.startTime}
                  dateFormat="HH:mm "
                  showTimeSelectOnly
                  timePicker
                  timeIntervals={15}
                  timePicker24Hour
                  timeFormat="HH:mm"
                  inputProps={{
                    required: true,
                    helperText:
                      `${startTimeStr}` + t("_in_current_user_timezone_"),
                    placeholder: t("_start_time_")
                  }}
                  onChange={value => {
                    this.setFieldValue("startTime", value);
                  }}
                  label={t("_from_") + " *"}
                />
                <Typography>
                  <FormHelperText>
                    {startTimeStr + " " + t("_in_current_user_timezone_")}
                  </FormHelperText>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <DateSelect
                  date={this.state.endTime}
                  dateFormat="HH:mm "
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  showTimeSelectOnly
                  timePicker
                  timePicker24Hour
                  inputProps={{
                    required: true,
                    helperText:
                      `${endTimeStr}` + t("_in_current_user_timezone_"),
                    placeholder: t("_end_time_")
                  }}
                  onChange={value => {
                    this.setFieldValue("endTime", value);
                  }}
                  label={t("_to_") + " *"}
                />
                <Typography>
                  <FormHelperText>
                    {endTimeStr + " " + t("_in_current_user_timezone_")}
                  </FormHelperText>
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ pb: { xs: 8, sm: 12.5 } }}>
            <PullRight>
              <Button
                variant="contained"
                color="error"
                onClick={() => this.setState({ show: false })}
                sx={{ mr: 1 }}
              >
                {t("_cancel_")}
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  this.onSave();
                }}
              >
                {t("_save_")}
              </Button>
            </PullRight>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

const ShiftForm = props => {
  const { t } = props;
  const {
    TextField,
    Grid,
    Checkbox,
    Switch,
    Typography,
    Box,
    FormHelperText,
    LocalizationProvider,
    DesktopTimePicker,
    AdapterMoment
  } = Materio;
  let startTime = props.getFieldValue("startTime");
  let endTime = props.getFieldValue("endTime");
  let startTimeStr =
    moment.isMoment(startTime) &&
    moment
      .tz(
        startTime.format(`${DATE_FORMAT} HH:mm`),
        `${DATE_FORMAT} HH:mm`,
        ACCOUNT_TIMEZONE
      )
      .tz(current_user_timezone)
      .format("HH:mm");
  let endTimeStr =
    moment.isMoment(endTime) &&
    moment
      .tz(
        endTime.format(`${DATE_FORMAT} HH:mm`),
        `${DATE_FORMAT} HH:mm`,
        ACCOUNT_TIMEZONE
      )
      .tz(current_user_timezone)
      .format("HH:mm");
  return (
    <form>
      <Grid container spacing={6}>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            id="code"
            label={t("_code_")}
            value={props.getFieldValue("code")}
            size="small"
            variant="outlined"
            onChange={e => {
              props.setFieldValue("code", e.target.value);
            }}
            required
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            fullWidth
            id="name"
            label={t("_name_")}
            value={props.getFieldValue("name")}
            size="small"
            variant="outlined"
            onChange={e => {
              props.setFieldValue("name", e.target.value);
            }}
            required
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            id="shift_description"
            label={t("_description_")}
            value={props.getFieldValue("description")}
            variant="outlined"
            size="small"
            onChange={e => {
              props.setFieldValue("description", e.target.value);
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DesktopTimePicker
              label={`${t("_from_")}`}
              timeSteps={{ minutes: 1 }}
              ampm={false}
              defaultValue={props.getFieldValue("startTime")}
              onChange={value => {
                props.setStartTime(value);
              }}
              disabled={props.getFieldValue("shiftKey") ? true : false}
            />
          </LocalizationProvider>
          <FormHelperText>
            {startTimeStr + " " + t("_in_current_user_timezone_")}
          </FormHelperText>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <LocalizationProvider dateAdapter={AdapterMoment}>
            <DesktopTimePicker
              label={`${t("_to_")}`}
              timeSteps={{ minutes: 1 }}
              ampm={false}
              defaultValue={props.getFieldValue("endTime")}
              onChange={value => {
                props.setEndTime(value);
              }}
              disabled={props.getFieldValue("shiftKey") ? true : false}
            />
          </LocalizationProvider>
          <FormHelperText>
            {endTimeStr + " " + t("_in_current_user_timezone_")}
          </FormHelperText>
        </Grid>
        <Grid
          item
          xs={12}
          lg={8}
          xl={6}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline"
          }}
        >
          <Box>
            <Switch
              color="primary"
              checked={props.getFieldValue("defaultShift")}
              onChange={props.setDefaultShift}
            />
            {t("_default_shift_")}
          </Box>
          <Box>
            <Switch
              color="primary"
              checked={props.getFieldValue("previousDay")}
              onChange={props.setPreviousDay}
            />
            {t("_associated_with_previous_day_")}
          </Box>
          <Box>
            <Switch
              color="primary"
              checked={props.getFieldValue("nextDay")}
              onChange={props.setNextDay}
            />
            {t("_associated_with_next_day_")}
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};
const DeleteShiftDowntime = props => {
  const [deleteDialog, setDeleteDialog] = React.useState(false);
  const { key, name, t } = props;
  const { Tooltip, IconButton } = Materio;
  return (
    <div>
      <Tooltip title={t("_delete_")}>
        <IconButton color="error" onClick={() => setDeleteDialog(true)}>
          <Materio.IconifyIcon icon="material-symbols:delete" />
        </IconButton>
      </Tooltip>
      <DeleteDialog
        onConfirm={() => {
          props.onDelete(key, name);
          setDeleteDialog(false);
        }}
        onCancel={() => setDeleteDialog(false)}
        open={deleteDialog}
        confirmText={t("_generic_messages_._will_be_permanently_deleted_", {
          name: name
        })}
        onClose={() => setDeleteDialog(false)}
      />
    </div>
  );
};
