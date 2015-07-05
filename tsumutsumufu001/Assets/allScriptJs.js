#pragma strict
import UnityEngine.UI;

public
var ballPrefab: GameObject;

public
var ballSprites: Sprite[];

private
var firstBall:GameObject;

private
var removableBallList: Array;

private
var lastBall:GameObject;

private
var currentName: String;

private
var isPlaying = false;

public
var timer: GameObject;

private
var timerText: Text;

private
var timeLimit = 60;

private
var countTime = 5;

private
var isDragging=false;

public
var bombPrefab: GameObject;

function Start () {
	timerText = timer.GetComponent(Text);
	CountDwn();
	DropBall(155);
}

private
function CountDonw(){
	var count = countTime;
	while(count > 0){
		timeText.text = count.ToString();
		yield WaitForSeconds(1);
		count -= 1;
	}
	timerText.text = "Start!";
	isPlaying = true;
	yield WaitForSeconds(1);
	StartTimer();
}

private
function StartTimer(){
	var count = timeLimit;
	while (count>0){
		timerText.text = count.ToString();
		yield WaitForSeconds(1);
		count= 1;
	}
	timerText.text = "Finish";
	OnDragEnd();
	isPlaying=false;
}


private
function DropBall(count:int){
	for (var i=0;i<count; i++){
		var ball = Instantiate(ballPrefab);
		ball.transform.position.x=Random.Range(-2.0,2.0);
		ball.transform.position.y=-10;
		ball.transform.eulerAngles.z=Random.Range(-40,40);
		var SpriteId: int = Random.Range(0,5);
		ball.name="Ball"+SpriteId;
		var balltexture = ball.GetComponent(SpriteRenderer);
		balltexture.sprite = ballSprites[SpriteId];
		yield WaitForSeconds(0.05);
	}

}
function Update () {
	if (Input.GetMouseButtonDown(0)){
		OnClick();
	}

	if(isPlaying){
	if (Input.GetMouseButton(0) && firstBall == null){
	OnDragStart();
	} else if (Input.GetMouseButtonUp(0)){
	OnDragEnd();
	} else if (firstBall != null){
	OnDragging();
	}
	
	}
}

private
function GetCurrentHitCollider(){
	var hit:RaycastHit2D = Physics2D.Raycast(Camera.main.ScreenToWorldPoint(Input.mousePosition),Vector2.zero);
	return hit.collider;
}

function OnClick(){
	var col = GetCurrentHitCollider();
	if (col != null){
		var colObj = col.gameObject;
		if (colObj.name == "bomb" && isPlaying && !isDragging){
			ClearBomb(colObj);
		}
	}
}

private
function ClearBomb(colObj: GameObject){
	var balls = GameObject.FindGameObjectsWithTag("Ball");
	removableBallList = new Array();
	for (var ball in balls){
		var dist = Vector2.Distance(colObj.transform.position,ball.transform.position);
		if(dist < 1.8) removableBallList.push(ball);
	}
	ClearRemovables(1);
	Destroy(colObj);

}

/*
private
function ClearRemovables(mode:int){
	if (removableBallList != null){
		var length = removableBallList.length;
		for (var i=0; i<length; i++){
			Destroy(removableBallList[i]);
		}
		currentScore +=((CalculateBaseScore(length)+50*length));
		isDragging=false;
		DropBall(length);	
	}
}
*/

private
function ClearRemovables(mode:int){
	if (removableBallList != null){
		var length = removableBallList.length;
		for ( var i = 0; i < length; i++){
			if (i==length - 1 && mode == 0 && length > 5){
				var bomb = Instantiate(bombPrefab);
				var obj:GameObject = removableBallList[i];
				bomb.transform.position= obj.transform.position;
				bomb.name = "bomb";
			}
			Destroy(removableBallList[i]);
		}
		currentScore += ((CalculateBaseScore(length) + 50 * length));
		isDragging = false;
		DropBall(length);
	}
}

private
function ChangeColor(obj:GameObject,transparency:float){
	var ballTexture=obj.GetComponent(SpriteRenderer);
	ballTexture.color.a=transparency;
}

private
function OnDragStart(){
	var col = GetCurrentHitCollinder();
	if (col != null){
		var colObj = col.gameObject;
		if (colObj.name.IndexOf("Ball") != -1){
			removableBallList = new Array();
			isDragging=true;
			firstBall= colObj;
			currentName=colObj.name;
			PushToList(colObj);
		}	
	}
}

/*private
function OnDragStart(){
	var col = GetCurrentHitCollinder();
	if (col != null){
		var colObj = col.gameObject;
		if (colObj.name.IndexOf("Ball") != -1){
			removableBallList= new Array();
			firstBall=colObj;
			currentName = colObj.name;
			PushToList(colObj);
		}
	}
}
*/

function PushToList(obj:GameObject){
	lastBall = obj;
	ChangeColor(obj,0.5);
	removableBallList.push(obj);
	obj.name="_"+ obj.name;
}
function GetCurrentHitCollinder(){
	var hit:RaycastHit2D = Physics2D.Raycast(Camera.main.ScreenToWorldPoint(Input.mousePosition),Vector2.zero);
	return hit.collider;
}



private
function OnDragEnd(){
 	if (firstBall != null){
		var length =removableBallList.length;
		if (length>=3){
			ClearRemovables(0);
		}else{
			for (var j=0; j<length; j++){
				var listedBall: GameObject = removableBallList[j];
				ChangeColor(listedBall,1.0);
				listedBall.name=listedBall.name.Substring(1,5);
			}	
		}
		firstBall = null;
	}
}

/*
private
function OnDragEnd(){
	if (firstBall != null){
		var length = removableBallList.length;
		if (length >= 3){
			for (var i=0; i< length; i++){
				Destroy(removableBallList[i]);
			}
			DropBall(length * 2);
		}else{
			for (var j=0; j< length; j++){
				var listedBall: GameObject = removableBallList[j];
				ChangeColor(listedBall,1.0);
				listedBall.name=listedBall.name.Substring(1,5);
			}
		}
		firstBall = null;	
	}
}
*/

private
function OnDragging(){
	var col = GetCurrentHitCollinder();
	if(col != null){
		var colObj = col.gameObject;
		if(colObj.name == currentName){
			if (lastBall != colObj){
				var dist = Vector2.Distance(lastBall.transform.position,colObj.transform.position);
				if (dist <= 1.5){
					PushToList(colObj);
				}
			}
		}
	}
}
public function Reset(){
	Application.LoadLevel("Main");
}



