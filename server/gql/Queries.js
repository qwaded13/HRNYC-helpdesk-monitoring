// const db = require('../../db/index.js');

let hello = (parent, args, context, info) => `Hello ${args.name || 'World'}`;

function allStaff (parent, args, context, info) {
  return context.db.query('SELECT * FROM staff')
    .then(result => {
      return result.rows;
    })
    .catch(err => {
      console.log(err);
    });
}

function staff (parent, args, context, info) {
  return context.db.query({
    text: 'SELECT * FROM staff WHERE staff_slack_id = $1',
    values: [args.staff_slack_id],
  })
    .then(result => {
      console.log(result);
      return result.rows[0];
    })
    .catch(err => {
      console.log(err);
    });
} 

function allHelpRequests (parent, args, context, info) {
  // let sql = args.cohort_number ? 'SELECT * FROM helpdesk' : 'SELECT * FROM helpdesk'

  if (args.cohort_number) {
    console.log('cohort number', args.cohort_number);

    return context.db.query(
      `
      SELECT * FROM cohort
      WHERE cohort.cohort_number = '${args.cohort_number}'
      `
    ).then(cohortData => {
      console.log('COHORT DATA', cohortData);
      return context.db.query(
        `
        SELECT helpdesk.student_name, student.cohort_number, helpdesk.opened_ts from helpdesk 
        INNER JOIN student 
        ON student.student_slack_id = helpdesk.slack_id
        WHERE student.cohort_number = '${args.cohort_number}'
        `
        )
        .then(result => {
  
          console.log('COHORT SEARCH', result); 
          return result
        })
        .then(result => {
          return result.rows; 
        })
        .catch(err => {
          console.log(err);
        });
    })

  } else {
    console.log('no args')
    return context.db.query('SELECT * FROM helpdesk')
      .then(result => {
        return result.rows; 
      })
      .catch(err => {
        console.log(err);
      });
  }

}

function staffHelpRequests (parent, args, context, info) {
  let staffID = parent ? parent : args.staff_slack_id;
  console.log(args);
  console.log(parent);
  return context.db.query({
    text: 'SELECT * FROM helpdesk WHERE staff_slack_id = $1',
    values: [staffID],
  }) 
    .then(result => {
      console.log(result);
      return result.rows;
    })
    .catch(err => {
      console.log(err);
    });
} 

function helpdesks({staff_slack_id}, args, context, info) {
  console.log(staff_slack_id);
  return context.db.query({
    text: 'SELECT * FROM helpdesk WHERE staff_slack_id = $1',
    values: [staff_slack_id],
  }) 
    .then(result => {
      console.log(result.rows);
      return result.rows;
    })
    .catch(err => {
      console.log(err);
    });
}

function helpdeskCount({staff_slack_id}, args, context, info) {
  console.log(staff_slack_id);
  return context.db.query({
    text: 'SELECT COUNT(*) FROM helpdesk WHERE staff_slack_id = $1',
    values: [staff_slack_id],
  }) 
    .then(result => {
      return result.rows[0].count;
    })
    .catch(err => {
      console.log(err);
    });
}

function helpdeskAvgClaimTime({staff_slack_id}, args, context, info) {
  console.log(staff_slack_id);
  return context.db.query({
    text: `
      SELECT 
        helpdesk.staff_name, 
        ROUND
        (
          AVG
            (
              helpdesk.claimed_ts - helpdesk.opened_ts
            )
        , 2) 
        AS avg_claim_time
      FROM helpdesk
      WHERE helpdesk.staff_slack_id = $1
      GROUP BY helpdesk.staff_name
      `,
    values: [staff_slack_id],
  }) 
    .then(result => {
      return parseFloat(result.rows[0].avg_claim_time);
    })
    .catch(err => {
      console.log(err);
    });
}



module.exports = {
  Query: {
    hello,
    allStaff,
    staff,
    allHelpRequests, 
    staffHelpRequests
  },
  Staff: {
    helpdesks,
    helpdeskCount,
    helpdeskAvgClaimTime
  }
}